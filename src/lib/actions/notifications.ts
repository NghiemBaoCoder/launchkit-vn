"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/types";
import type { Notification } from "@/types";

export async function listNotificationsAction(limit = 15): Promise<ActionResult<{ items: Notification[]; unread: number }>> {
  try {
    const profile = await requireProfileAction();
    const supabase = await createClient();
    const [{ data }, { count }] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(limit),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", profile.id).is("read_at", null),
    ]);
    return ok({ items: data ?? [], unread: count ?? 0 });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi tải thông báo");
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", profile.id);
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", profile.id).is("read_at", null);
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return ok(undefined, "Đã đánh dấu tất cả là đã đọc");
}
