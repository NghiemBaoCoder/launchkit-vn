"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/data/activity";
import { fail, ok, type ActionResult, type Coupon } from "@/types";
import { adminActionError, nullable, zodFieldErrors, zodMessage } from "./admin-helpers";

const dateField = z.string().trim().optional().default("");

const couponSchema = z
  .object({
    id: z.uuid().optional(),
    code: z.string().trim().min(3, "Mã tối thiểu 3 ký tự").max(32).regex(/^[A-Za-z0-9_-]+$/, "Mã chỉ gồm chữ, số, gạch ngang/gạch dưới"),
    description: z.string().trim().max(300).optional().default(""),
    type: z.enum(["fixed", "percentage"]),
    value: z.number().min(0, "Giá trị không âm"),
    max_discount: z.number().min(0).nullable().optional(),
    min_order: z.number().min(0).default(0),
    usage_limit: z.number().int().min(1).nullable().optional(),
    per_user_limit: z.number().int().min(1, "Tối thiểu 1 lần/người").default(1),
    starts_at: dateField,
    expires_at: dateField,
    applicable_product_ids: z.array(z.uuid()).default([]),
    active: z.boolean().default(true),
  })
  .refine((v) => v.type !== "percentage" || v.value <= 100, { message: "Phần trăm giảm tối đa 100", path: ["value"] })
  .refine((v) => v.type !== "percentage" || v.value > 0, { message: "Phần trăm giảm phải lớn hơn 0", path: ["value"] })
  .refine((v) => v.type !== "fixed" || v.value > 0, { message: "Số tiền giảm phải lớn hơn 0", path: ["value"] });

export type CouponInput = z.input<typeof couponSchema>;

function toIso(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function upsertCouponAction(input: CouponInput): Promise<ActionResult<Coupon>> {
  try {
    const admin = await requireAdminAction();
    const parsed = couponSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const v = parsed.data;
    const code = v.code.toUpperCase();
    const starts = toIso(v.starts_at);
    const expires = toIso(v.expires_at);
    if (v.starts_at && !starts) return fail("Ngày bắt đầu không hợp lệ", "validation", { starts_at: ["Không hợp lệ"] });
    if (v.expires_at && !expires) return fail("Ngày hết hạn không hợp lệ", "validation", { expires_at: ["Không hợp lệ"] });
    if (starts && expires && new Date(expires) <= new Date(starts)) return fail("Ngày hết hạn phải sau ngày bắt đầu", "validation", { expires_at: ["Phải sau ngày bắt đầu"] });

    const supabase = await createClient();
    const dup = await supabase.from("coupons").select("id").ilike("code", code).neq("id", v.id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (dup.data) return fail(`Mã "${code}" đã tồn tại`, "conflict", { code: ["Mã đã tồn tại"] });

    const payload = {
      code,
      description: nullable(v.description),
      type: v.type,
      value: v.value,
      max_discount: v.type === "percentage" ? v.max_discount ?? null : null,
      min_order: v.min_order,
      usage_limit: v.usage_limit ?? null,
      per_user_limit: v.per_user_limit,
      starts_at: starts,
      expires_at: expires,
      applicable_product_ids: Array.from(new Set(v.applicable_product_ids)),
      active: v.active,
    };

    if (v.id) {
      const { data: before } = await supabase.from("coupons").select("*").eq("id", v.id).maybeSingle();
      if (!before) return fail("Không tìm thấy mã giảm giá", "not_found");
      const { data, error } = await supabase.from("coupons").update(payload).eq("id", v.id).select("*").single();
      if (error) return fail(error.message);
      await logAudit({ actorId: admin.id, action: "admin.coupon.update", targetType: "coupon", targetId: v.id, before, after: data });
      revalidatePath("/admin/coupons");
      return ok(data, "Đã cập nhật mã giảm giá");
    }
    const { data, error } = await supabase.from("coupons").insert({ ...payload, created_by: admin.id }).select("*").single();
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.coupon.create", targetType: "coupon", targetId: data.id, after: data });
    revalidatePath("/admin/coupons");
    return ok(data, `Đã tạo mã ${code}`);
  } catch (e) {
    return adminActionError(e);
  }
}

/** Vô hiệu hoá / kích hoạt mã (không xoá để giữ lịch sử sử dụng). */
export async function toggleCouponActiveAction(id: string, active: boolean): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.coupon.toggle", targetType: "coupon", targetId: id, after: { active } });
    revalidatePath("/admin/coupons");
    return ok(undefined, active ? "Đã kích hoạt mã" : "Đã vô hiệu hoá mã");
  } catch (e) {
    return adminActionError(e);
  }
}
