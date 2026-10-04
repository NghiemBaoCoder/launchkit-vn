"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/data/activity";
import { ENTITLEMENT_KEYS } from "@/lib/access/policy";
import { slugify } from "@/lib/utils";
import { fail, ok, type ActionResult, type JsonValue, type Product } from "@/types";
import { adminActionError, linesToArray, nullable, zodFieldErrors, zodMessage } from "./admin-helpers";

const productSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(120),
    slug: z.string().trim().max(60).regex(/^[a-z0-9-]*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
    description: z.string().trim().max(1000).optional().default(""),
    kind: z.enum(["free", "one_time", "subscription"]),
    price: z.number().min(0, "Giá không âm").max(1_000_000_000),
    sale_price: z.number().min(0).max(1_000_000_000).nullable().optional(),
    billing_interval: z.enum(["month", "year", ""]).optional().default(""),
    features: z.string().max(5000).optional().default(""),
    entitlements: z.array(z.enum(ENTITLEMENT_KEYS)).default([]),
    entitlement_scope: z.enum(["business", "account"]),
    credits: z.number().int().min(0).max(100000).default(0),
    active: z.boolean().default(true),
    recommended: z.boolean().default(false),
    sort_order: z.number().int().min(0).max(9999).default(0),
  })
  .refine((v) => v.sale_price == null || v.sale_price <= v.price, { message: "Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc", path: ["sale_price"] })
  .refine((v) => v.kind !== "subscription" || v.billing_interval, { message: "Gói định kỳ cần chu kỳ thanh toán", path: ["billing_interval"] });

export type ProductInput = z.input<typeof productSchema>;

function revalidateProducts(id?: string) {
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}`);
  revalidatePath("/pricing");
  revalidatePath("/", "layout");
}

/** Tạo / cập nhật sản phẩm. */
export async function upsertProductAction(input: ProductInput): Promise<ActionResult<Product>> {
  try {
    const admin = await requireAdminAction();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const v = parsed.data;
    const slug = v.slug || slugify(v.name);
    if (!slug) return fail("Không tạo được slug từ tên", "validation", { slug: ["Slug không hợp lệ"] });

    const supabase = await createClient();
    const dup = await supabase.from("products").select("id").eq("slug", slug).neq("id", v.id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (dup.data) return fail(`Slug "${slug}" đã được dùng`, "conflict", { slug: ["Slug đã tồn tại"] });

    const payload = {
      name: v.name,
      slug,
      description: nullable(v.description),
      kind: v.kind,
      price: v.kind === "free" ? 0 : v.price,
      sale_price: v.kind === "free" ? null : v.sale_price ?? null,
      billing_interval: v.kind === "subscription" ? v.billing_interval || "month" : null,
      features: linesToArray(v.features) as JsonValue,
      entitlements: Array.from(new Set(v.entitlements)),
      entitlement_scope: v.entitlement_scope,
      credits: v.credits,
      active: v.active,
      recommended: v.recommended,
      sort_order: v.sort_order,
    };

    if (v.id) {
      const { data: before } = await supabase.from("products").select("*").eq("id", v.id).maybeSingle();
      if (!before) return fail("Không tìm thấy sản phẩm", "not_found");
      const { data, error } = await supabase.from("products").update(payload).eq("id", v.id).select("*").single();
      if (error) return fail(error.message);
      await logAudit({ actorId: admin.id, action: "admin.product.update", targetType: "product", targetId: v.id, before, after: data });
      revalidateProducts(v.id);
      return ok(data, "Đã cập nhật sản phẩm");
    }
    const { data, error } = await supabase.from("products").insert(payload).select("*").single();
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.product.create", targetType: "product", targetId: data.id, after: data });
    revalidateProducts(data.id);
    return ok(data, "Đã tạo sản phẩm");
  } catch (e) {
    return adminActionError(e);
  }
}

export async function toggleProductActiveAction(id: string, active: boolean): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { error } = await supabase.from("products").update({ active }).eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.product.toggle", targetType: "product", targetId: id, after: { active } });
    revalidateProducts(id);
    return ok(undefined, active ? "Đã bật sản phẩm" : "Đã ẩn sản phẩm");
  } catch (e) {
    return adminActionError(e);
  }
}
