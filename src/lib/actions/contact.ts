"use server";

import { z } from "zod";
import { fail, ok, type ActionResult } from "@/types";
import { getCurrentUser } from "@/lib/auth";
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
 * Nhận tin nhắn liên hệ từ website. Khách chưa đăng nhập vẫn gửi được:
 * bản ghi được lưu vào activity_logs (action = contact.message) bằng service role
 * vì RLS chỉ cho phép người dùng đã đăng nhập tự ghi log của mình.
 */
export async function sendContactMessageAction(input: ContactInput): Promise<ActionResult<undefined>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Thông tin chưa hợp lệ, vui lòng kiểm tra lại.", "validation", parsed.error.flatten().fieldErrors);
  }
  const { name, email, topic, message } = parsed.data;
  try {
    const user = await getCurrentUser();
    await logActivity({
      userId: user?.id ?? null,
      action: "contact.message",
      entityType: "contact",
      title: `Liên hệ: ${name} (${topic})`,
      metadata: { name, email, topic, message, user_email: user?.email ?? null },
    });
    return ok(undefined, "Đã gửi");
  } catch {
    return fail("Không gửi được tin nhắn lúc này, vui lòng thử lại sau.", "server");
  }
}
