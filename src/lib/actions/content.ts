"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { contentItemSchema } from "@/lib/workspace/schemas";
import { fail, ok, type ActionResult, type ContentItem } from "@/types";

export async function createContentItemAction(businessId: string, input: unknown): Promise<ActionResult<ContentItem>> {
  const profile = await requireProfileAction();
  const parsed = contentItemSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const { count } = await supabase.from("content_items").select("id", { count: "exact", head: true }).eq("business_id", businessId);
  const { data, error } = await supabase.from("content_items").insert({ business_id: businessId, ...parsed.data, published_at: parsed.data.status === "published" ? new Date().toISOString() : null, sort_order: count ?? 0 }).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId, action: "content.created", entityType: "content_item", entityId: data.id, title: `Thêm nội dung "${data.title}"` });
  revalidatePath(`/business/${businessId}/content`);
  return ok(data, "Đã thêm nội dung");
}

export async function updateContentItemAction(itemId: string, input: unknown): Promise<ActionResult<ContentItem>> {
  const profile = await requireProfileAction();
  const parsed = contentItemSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const { data: existing } = await supabase.from("content_items").select("published_at").eq("id", itemId).maybeSingle();
  const publishedAt = parsed.data.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : null;
  const { data, error } = await supabase.from("content_items").update({ ...parsed.data, published_at: publishedAt }).eq("id", itemId).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "content.updated", entityType: "content_item", entityId: data.id, title: `Sửa nội dung "${data.title}"` });
  revalidatePath(`/business/${data.business_id}/content`);
  return ok(data, "Đã lưu");
}

export async function setContentStatusAction(itemId: string, status: "idea" | "draft" | "ready" | "published"): Promise<ActionResult<ContentItem>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_items").update({ status, published_at: status === "published" ? new Date().toISOString() : null }).eq("id", itemId).select("*").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}/content`);
  return ok(data, status === "published" ? "Đã đánh dấu đã đăng" : "Đã cập nhật trạng thái");
}

export async function duplicateContentItemAction(itemId: string): Promise<ActionResult<ContentItem>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data: src } = await supabase.from("content_items").select("*").eq("id", itemId).maybeSingle();
  if (!src) return fail("Không tìm thấy nội dung", "not_found");
  const { data, error } = await supabase.from("content_items").insert({ business_id: src.business_id, title: `${src.title} (bản sao)`, hook: src.hook, caption: src.caption, cta: src.cta, platform: src.platform, content_type: src.content_type, status: "draft", scheduled_date: src.scheduled_date, sort_order: src.sort_order + 1 }).select("*").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${src.business_id}/content`);
  return ok(data, "Đã nhân bản");
}

export async function deleteContentItemAction(itemId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_items").delete().eq("id", itemId).select("business_id, title").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "content.deleted", entityType: "content_item", entityId: itemId, title: `Xoá nội dung "${data.title}"` });
  revalidatePath(`/business/${data.business_id}/content`);
  return ok(undefined, "Đã xoá");
}
