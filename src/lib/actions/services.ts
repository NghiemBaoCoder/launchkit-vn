"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { fail, ok, type ActionResult, type Service } from "@/types";
import { serviceSchema } from "@/lib/workspace/schemas";

async function ownsBusiness(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("id").eq("id", businessId).maybeSingle();
  return !!data;
}

export async function createServiceAction(businessId: string, input: unknown): Promise<ActionResult<Service>> {
  const profile = await requireProfileAction();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin dịch vụ không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  if (!(await ownsBusiness(businessId))) return fail("Không tìm thấy business", "not_found");
  const supabase = await createClient();
  const { count } = await supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", businessId);
  const d = parsed.data;
  const { data, error } = await supabase
    .from("services")
    .insert({ business_id: businessId, name: d.name, description: d.description, price: d.price, sale_price: d.sale_price ?? null, unit: d.unit, delivery_time: d.delivery_time, features: d.features, benefits: d.benefits, target_customer: d.target_customer, upsell: d.upsell, active: d.active, sort_order: count ?? 0 })
    .select("*")
    .single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId, action: "service.created", entityType: "service", entityId: data.id, title: `Thêm dịch vụ "${data.name}"` });
  revalidatePath(`/business/${businessId}`, "layout");
  return ok(data, "Đã thêm dịch vụ");
}

export async function updateServiceAction(serviceId: string, input: unknown): Promise<ActionResult<Service>> {
  const profile = await requireProfileAction();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin dịch vụ không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const d = parsed.data;
  const { data, error } = await supabase
    .from("services")
    .update({ name: d.name, description: d.description, price: d.price, sale_price: d.sale_price ?? null, unit: d.unit, delivery_time: d.delivery_time, features: d.features, benefits: d.benefits, target_customer: d.target_customer, upsell: d.upsell, active: d.active })
    .eq("id", serviceId)
    .select("*")
    .single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "service.updated", entityType: "service", entityId: data.id, title: `Sửa dịch vụ "${data.name}"` });
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(data, "Đã lưu dịch vụ");
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").delete().eq("id", serviceId).select("business_id, name").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "service.deleted", entityType: "service", entityId: serviceId, title: `Xoá dịch vụ "${data.name}"` });
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(undefined, "Đã xoá dịch vụ");
}

export async function reorderServicesAction(businessId: string, orderedIds: string[]): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  if (!(await ownsBusiness(businessId))) return fail("Không tìm thấy business", "not_found");
  const supabase = await createClient();
  await Promise.all(orderedIds.map((id, i) => supabase.from("services").update({ sort_order: i }).eq("id", id).eq("business_id", businessId)));
  revalidatePath(`/business/${businessId}`, "layout");
  return ok(undefined);
}

export async function duplicateServiceAction(serviceId: string): Promise<ActionResult<Service>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: src } = await supabase.from("services").select("*").eq("id", serviceId).maybeSingle();
  if (!src) return fail("Không tìm thấy dịch vụ", "not_found");
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
  void _id; void _c; void _u;
  const { data, error } = await supabase.from("services").insert({ ...rest, name: `${src.name} (bản sao)`, sort_order: src.sort_order + 1 }).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: src.business_id, action: "service.duplicated", entityType: "service", entityId: data.id, title: `Nhân bản dịch vụ "${src.name}"` });
  revalidatePath(`/business/${src.business_id}`, "layout");
  return ok(data, "Đã nhân bản");
}
