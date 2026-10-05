"use server";

import { z } from "zod";
import { fail, ok, type ActionResult } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/data/activity";

const CONTACT_TOPICS = ["support", "billing", "partnership", "feedback", "other"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(80, "Tên tối đa 80 ký tự"),
  email: z.email("Email không hợp lệ").max(120),
  topic: z.enum(CONTACT_TOPICS, { message: "Chọn chủ đề" }),
  message: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự").max(2000, "Nội dung tối đa 2000 ký tự"),
});

export type ContactInput = z.input<typeof contactSchema>;

/**
 * Nhận tin nhắn liên hệ từ website. Khách chưa đăng nhập vẫn gửi được: ghi vào
 * contact_messages bằng service role (RLS không mở insert cho anon), admin xử lý ở /admin/messages.
 * Nếu DB chưa chạy migration contact_messages → rơi về activity_logs để không mất tin.
 */
export async function sendContactMessageAction(input: ContactInput): Promise<ActionResult<undefined>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Thông tin chưa hợp lệ, vui lòng kiểm tra lại.", "validation", parsed.error.flatten().fieldErrors);
  }
  const { name, email, topic, message } = parsed.data;
  try {
    const user = await getCurrentUser();
    const admin = createAdminClient();
    // Chống spam đơn giản: tối đa 5 tin / email / giờ.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
    if (!countError && (count ?? 0) >= 5) return fail("Bạn đã gửi quá nhiều tin trong 1 giờ. Vui lòng thử lại sau.", "rate_limited");

    const { error } = await admin.from("contact_messages").insert({ user_id: user?.id ?? null, name, email, topic, message });
    if (error) {
      // 42P01: bảng chưa tồn tại (chưa chạy migration) → fallback.
      if (error.code === "42P01" || /contact_messages/.test(error.message)) {
        await logActivity({ userId: user?.id ?? null, action: "contact.message", entityType: "contact", title: `Liên hệ: ${name} (${topic})`, metadata: { name, email, topic, message, user_email: user?.email ?? null } });
      } else {
        throw new Error(error.message);
      }
    }
    return ok(undefined, "Đã gửi");
  } catch {
    return fail("Không gửi được tin nhắn lúc này, vui lòng thử lại sau.", "server");
  }
}
