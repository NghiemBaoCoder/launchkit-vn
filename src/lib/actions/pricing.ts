"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { packageSchema } from "@/lib/workspace/schemas";
import { fail, ok, type ActionResult, type JsonValue, type PricingPackage } from "@/types";

export async function createPackageAction(businessId: string, input: unknown): Promise<ActionResult<PricingPackage>> {
  const profile = await requireProfileAction();
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin gói không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const { count } = await supabase.from("pricing_packages").select("id", { count: "exact", head: true }).eq("business_id", businessId);
  const d = parsed.data;
  const { data, error } = await supabase.from("pricing_packages").insert({ business_id: businessId, tier: "custom", name: d.name, description: d.description, price: d.price, billing_unit: d.billing_unit, features: d.features as JsonValue, recommended: d.recommended, sort_order: count ?? 0 }).select("*").single();
  if (error) return fail(error.message);
  if (d.recommended) await supabase.from("pricing_packages").update({ recommended: false }).eq("business_id", businessId).neq("id", data.id);
  await logActivity({ userId: profile.id, businessId, action: "package.created", entityType: "pricing_package", entityId: data.id, title: `Thêm gói giá "${d.name}"` });
  revalidatePath(`/business/${businessId}`, "layout");
  return ok(data, "Đã thêm gói");
}

export async function updatePackageAction(packageId: string, input: unknown): Promise<ActionResult<PricingPackage>> {
  const profile = await requireProfileAction();
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin gói không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const d = parsed.data;
  const { data, error } = await supabase.from("pricing_packages").update({ name: d.name, description: d.description, price: d.price, billing_unit: d.billing_unit, features: d.features as JsonValue, recommended: d.recommended }).eq("id", packageId).select("*").single();
  if (error) return fail(error.message);
  if (d.recommended) await supabase.from("pricing_packages").update({ recommended: false }).eq("business_id", data.business_id).neq("id", data.id);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "package.updated", entityType: "pricing_package", entityId: data.id, title: `Sửa gói giá "${d.name}"` });
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(data, "Đã lưu gói");
}

export async function deletePackageAction(packageId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("pricing_packages").delete().eq("id", packageId).select("business_id, name").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "package.deleted", entityType: "pricing_package", entityId: packageId, title: `Xoá gói giá "${data.name}"` });
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(undefined, "Đã xoá gói");
}

export async function duplicatePackageAction(packageId: string): Promise<ActionResult<PricingPackage>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: src } = await supabase.from("pricing_packages").select("*").eq("id", packageId).maybeSingle();
  if (!src) return fail("Không tìm thấy gói", "not_found");
  const { data, error } = await supabase.from("pricing_packages").insert({ business_id: src.business_id, tier: "custom", name: `${src.name} (bản sao)`, description: src.description, price: src.price, billing_unit: src.billing_unit, features: src.features as JsonValue, recommended: false, sort_order: src.sort_order + 1 }).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: src.business_id, action: "package.duplicated", entityType: "pricing_package", entityId: data.id, title: `Nhân bản gói "${src.name}"` });
  revalidatePath(`/business/${src.business_id}`, "layout");
  return ok(data, "Đã nhân bản gói");
}
