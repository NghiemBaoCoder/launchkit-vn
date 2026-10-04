"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { fail, ok, type ActionResult, type ChecklistItem } from "@/types";

export async function toggleChecklistItemAction(input: { itemId: string; done: boolean }): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("checklist_items").update({ done: input.done }).eq("id", input.itemId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(undefined);
}

export async function addChecklistItemAction(input: { checklistId: string; title: string; description?: string }): Promise<ActionResult<ChecklistItem>> {
  const profile = await requireProfileAction();
  const parsed = z.object({ checklistId: z.string().uuid(), title: z.string().trim().min(1, "Nhập nội dung").max(200), description: z.string().trim().max(500).optional() }).safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { data: cl } = await supabase.from("checklists").select("id, business_id").eq("id", parsed.data.checklistId).maybeSingle();
  if (!cl) return fail("Không tìm thấy checklist", "not_found");
  const { count } = await supabase.from("checklist_items").select("id", { count: "exact", head: true }).eq("checklist_id", cl.id);
  const { data, error } = await supabase.from("checklist_items").insert({ checklist_id: cl.id, business_id: cl.business_id, title: parsed.data.title, description: parsed.data.description ?? null, sort_order: count ?? 0 }).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: cl.business_id, action: "checklist.item_added", entityType: "checklist_item", entityId: data.id, title: `Thêm việc "${data.title}"` });
  revalidatePath(`/business/${cl.business_id}`, "layout");
  return ok(data, "Đã thêm");
}

export async function updateChecklistItemAction(input: { itemId: string; title: string; description?: string }): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const parsed = z.object({ itemId: z.string().uuid(), title: z.string().trim().min(1).max(200), description: z.string().trim().max(500).optional() }).safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation");
  const supabase = await createClient();
  const { data, error } = await supabase.from("checklist_items").update({ title: parsed.data.title, description: parsed.data.description ?? null }).eq("id", parsed.data.itemId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(undefined, "Đã lưu");
}

export async function deleteChecklistItemAction(itemId: string): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("checklist_items").delete().eq("id", itemId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}`, "layout");
  return ok(undefined, "Đã xoá");
}

export async function reorderChecklistItemsAction(input: { checklistId: string; orderedIds: string[] }): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data: cl } = await supabase.from("checklists").select("business_id").eq("id", input.checklistId).maybeSingle();
  if (!cl) return fail("Không tìm thấy checklist", "not_found");
  await Promise.all(input.orderedIds.map((id, i) => supabase.from("checklist_items").update({ sort_order: i }).eq("id", id).eq("checklist_id", input.checklistId)));
  revalidatePath(`/business/${cl.business_id}`, "layout");
  return ok(undefined);
}

export async function resetChecklistAction(checklistId: string): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data: cl } = await supabase.from("checklists").select("business_id").eq("id", checklistId).maybeSingle();
  if (!cl) return fail("Không tìm thấy checklist", "not_found");
  const { error } = await supabase.from("checklist_items").update({ done: false }).eq("checklist_id", checklistId);
  if (error) return fail(error.message);
  revalidatePath(`/business/${cl.business_id}`, "layout");
  return ok(undefined, "Đã đặt lại checklist");
}
