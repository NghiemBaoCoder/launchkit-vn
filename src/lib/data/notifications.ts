import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType = "business_generated" | "section_regenerated" | "generation_failed" | "export_ready" | "export_failed" | "payment_success" | "payment_failed" | "credits_low" | "kit_unlocked" | "credits_adjusted" | "account" | "system";

/** Tạo thông báo nội bộ cho user (server-side, service role). */
export async function createNotification(userId: string, n: { type: NotificationType; title: string; body?: string; href?: string }) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({ user_id: userId, type: n.type, title: n.title, body: n.body ?? null, href: n.href ?? null });
}
