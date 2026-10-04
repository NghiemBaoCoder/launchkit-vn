"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { fail, ok, type ActionResult, type MarketingPlanItem } from "@/types";

const itemSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề").max(200),
  description: z.string().trim().max(1000),
  channel: z.string().trim().max(40),
  kind: z.enum(["task", "campaign", "promotion", "content"]),
  scheduled_date: z.string().nullable(),
  day_index: z.number().int().min(1).max(90),
});

export async function togglePlanItemAction(itemId: string, done: boolean): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("marketing_plan_items").update({ done }).eq("id", itemId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}/marketing`);
  return ok(undefined);
}

export async function upsertPlanItemAction(businessId: string, itemId: string | null, input: unknown): Promise<ActionResult<MarketingPlanItem>> {
  await requireProfileAction();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const d = parsed.data;
  const payload = { title: d.title, description: d.description, channel: d.channel, kind: d.kind, scheduled_date: d.scheduled_date, day_index: d.day_index };
  const q = itemId ? supabase.from("marketing_plan_items").update(payload).eq("id", itemId).select("*").single() : supabase.from("marketing_plan_items").insert({ business_id: businessId, ...payload }).select("*").single();
  const { data, error } = await q;
  if (error) return fail(error.message);
  revalidatePath(`/business/${businessId}/marketing`);
  return ok(data, itemId ? "Đã lưu" : "Đã thêm việc");
}

export async function deletePlanItemAction(itemId: string): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("marketing_plan_items").delete().eq("id", itemId).select("business_id").single();
  if (error) return fail(error.message);
  revalidatePath(`/business/${data.business_id}/marketing`);
  return ok(undefined, "Đã xoá");
}
