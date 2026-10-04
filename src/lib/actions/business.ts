"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfileAction } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { logActivity } from "@/lib/data/activity";
import { businessSettingsSchema } from "@/lib/workspace/schemas";
import { randomToken, slugify } from "@/lib/utils";
import { fail, ok, type ActionResult, type Business, type JsonValue, type Share } from "@/types";

async function getOwned(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("*").eq("id", businessId).maybeSingle();
  return data;
}

export async function updateBusinessSettingsAction(businessId: string, input: unknown): Promise<ActionResult<Business>> {
  const profile = await requireProfileAction();
  const parsed = businessSettingsSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const d = parsed.data;
  const { data, error } = await supabase.from("businesses").update({ name: d.name, industry_id: d.industry_id, business_type_id: d.business_type_id, currency: d.currency, location: d.location || null, contact: d.contact as JsonValue }).eq("id", businessId).select("*").single();
  if (error) return fail(error.message);
  // Đồng bộ liên hệ sang website
  await supabase.from("website_sites").update({ contact: { ...d.contact } as JsonValue }).eq("business_id", businessId);
  await logActivity({ userId: profile.id, businessId, action: "business.updated", entityType: "business", entityId: businessId, title: "Cập nhật thông tin business" });
  revalidatePath(`/business/${businessId}`, "layout");
  revalidatePath("/dashboard", "layout");
  return ok(data, "Đã lưu thông tin");
}

export async function updateBusinessLogoAction(businessId: string, logoUrl: string | null): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const parsed = z.string().url().nullable().safeParse(logoUrl);
  if (!parsed.success) return fail("URL logo không hợp lệ", "validation");
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ logo_url: parsed.data }).eq("id", businessId);
  if (error) return fail(error.message);
  revalidatePath(`/business/${businessId}`, "layout");
  revalidatePath("/dashboard", "layout");
  return ok(undefined, parsed.data ? "Đã cập nhật logo" : "Đã gỡ logo");
}

export async function archiveBusinessAction(businessId: string, archive: boolean): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const business = await getOwned(businessId);
  if (!business) return fail("Không tìm thấy business", "not_found");
  if (!archive) {
    const ctx = await getAccessContext();
    if (!can(ctx, "business.multiple")) {
      const supabase = await createClient();
      const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived");
      if ((count ?? 0) >= 1) return fail("Gói miễn phí chỉ có 1 business đang hoạt động. Lưu trữ business khác hoặc nâng cấp Pro Membership.", "limit");
    }
  }
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ status: archive ? "archived" : business.generated_at ? "ready" : "draft", archived_at: archive ? new Date().toISOString() : null }).eq("id", businessId);
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId, action: archive ? "business.archived" : "business.restored", entityType: "business", entityId: businessId, title: archive ? `Lưu trữ "${business.name}"` : `Khôi phục "${business.name}"` });
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/business/${businessId}`, "layout");
  return ok(undefined, archive ? "Đã lưu trữ business" : "Đã khôi phục business");
}

export async function deleteBusinessAction(businessId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const business = await getOwned(businessId);
  if (!business) return fail("Không tìm thấy business", "not_found");
  if (business.user_id !== profile.id) return fail("Chỉ chủ sở hữu mới được xoá", "forbidden");
  const admin = createAdminClient();
  // Dọn file export trong storage
  const { data: files } = await admin.storage.from("exports").list(`${profile.id}/${businessId}`);
  if (files?.length) await admin.storage.from("exports").remove(files.map((f) => `${profile.id}/${businessId}/${f.name}`));
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").delete().eq("id", businessId);
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: null, action: "business.deleted", entityType: "business", entityId: businessId, title: `Xoá business "${business.name}"` });
  revalidatePath("/dashboard", "layout");
  return ok(undefined, "Đã xoá business");
}

/** Nhân bản business: sao chép answers, assets, services, packages, content, checklists, documents, website, finance. */
export async function duplicateBusinessAction(businessId: string): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfileAction();
  const src = await getOwned(businessId);
  if (!src) return fail("Không tìm thấy business", "not_found");
  const ctx = await getAccessContext();
  if (!can(ctx, "business.multiple")) return fail("Nhân bản business cần gói Pro Membership (nhiều business).", "limit");
  const admin = createAdminClient();
  const supabase = await createClient();
  const slug = `${slugify(src.name)}-${randomToken(4).toLowerCase()}`;
  const { data: created, error } = await supabase.from("businesses").insert({ user_id: profile.id, name: `${src.name} (bản sao)`, slug, business_type_id: src.business_type_id, industry_id: src.industry_id, status: src.status === "archived" ? "ready" : src.status, logo_url: src.logo_url, currency: src.currency, location: src.location, contact: src.contact as JsonValue, onboarding_step: src.onboarding_step, onboarding_completed: src.onboarding_completed, generated_at: src.generated_at }).select("id").single();
  if (error || !created) return fail(error?.message ?? "Không nhân bản được");
  const newId = created.id;
  const copy = async (table: "business_answers" | "business_assets" | "services" | "pricing_packages" | "content_items" | "marketing_plan_items" | "finance_calculations" | "documents", patch?: Record<string, unknown>) => {
    const { data } = await admin.from(table).select("*").eq("business_id", businessId);
    if (!data?.length) return;
    const rows = (data as unknown as Record<string, unknown>[]).map((r) => {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = r;
      void _id; void _c; void _u;
      return { ...rest, business_id: newId, ...(patch ?? {}) };
    });
    await admin.from(table).insert(rows as never);
  };
  await copy("business_answers");
  await copy("business_assets", { version: 1 });
  await copy("services");
  await copy("pricing_packages");
  await copy("content_items", { status: "idea", published_at: null });
  await copy("marketing_plan_items", { done: false });
  await copy("finance_calculations");
  await copy("documents", { version: 1 });
  const { data: lists } = await admin.from("checklists").select("*, checklist_items(*)").eq("business_id", businessId);
  for (const l of lists ?? []) {
    const { data: nl } = await admin.from("checklists").insert({ business_id: newId, kind: l.kind, title: l.title, description: l.description }).select("id").single();
    if (nl && l.checklist_items.length) await admin.from("checklist_items").insert(l.checklist_items.map((i) => ({ checklist_id: nl.id, business_id: newId, title: i.title, description: i.description, done: false, sort_order: i.sort_order })));
  }
  const { data: site } = await admin.from("website_sites").select("*").eq("business_id", businessId).maybeSingle();
  if (site) await admin.from("website_sites").insert({ business_id: newId, slug: `${site.slug}-${randomToken(4).toLowerCase()}`, sections: site.sections as JsonValue, theme: site.theme as JsonValue, contact: site.contact as JsonValue, is_published: false });
  await logActivity({ userId: profile.id, businessId: newId, action: "business.duplicated", entityType: "business", entityId: newId, title: `Nhân bản từ "${src.name}"` });
  revalidatePath("/dashboard", "layout");
  return ok({ id: newId }, "Đã nhân bản business");
}

/* ---------- Chia sẻ public ---------- */
const shareSchema = z.object({ sections: z.array(z.enum(["brand", "services", "pricing", "sales", "marketing"])).min(1, "Chọn ít nhất một mục"), expiresInDays: z.number().int().min(0).max(365) });

export async function upsertShareAction(businessId: string, input: unknown): Promise<ActionResult<Share>> {
  const profile = await requireProfileAction();
  const parsed = shareSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const { data: existing } = await supabase.from("shares").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const expires = parsed.data.expiresInDays > 0 ? new Date(Date.now() + parsed.data.expiresInDays * 86400000).toISOString() : null;
  const q = existing
    ? supabase.from("shares").update({ sections: parsed.data.sections, expires_at: expires, active: true }).eq("id", existing.id).select("*").single()
    : supabase.from("shares").insert({ business_id: businessId, token: randomToken(20), sections: parsed.data.sections, expires_at: expires, active: true }).select("*").single();
  const { data, error } = await q;
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId, action: "share.updated", entityType: "share", entityId: data.id, title: "Cập nhật liên kết chia sẻ" });
  revalidatePath(`/business/${businessId}/settings`);
  return ok(data, "Đã cập nhật liên kết chia sẻ");
}

export async function toggleShareAction(shareId: string, active: boolean): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("shares").update({ active }).eq("id", shareId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}/settings`);
  return ok(undefined, active ? "Đã bật chia sẻ" : "Đã tắt chia sẻ");
}

export async function regenerateShareTokenAction(shareId: string): Promise<ActionResult<Share>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("shares").update({ token: randomToken(20), view_count: 0 }).eq("id", shareId).select("*").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}/settings`);
  return ok(data, "Đã tạo liên kết mới (liên kết cũ hết hiệu lực)");
}
