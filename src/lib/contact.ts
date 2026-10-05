import type { Database } from "@/types/database";

/** Hằng số dùng chung client/server cho hộp thư liên hệ (không import server-only). */
export type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
export type ContactStatus = Database["public"]["Enums"]["contact_status"];
export type ContactMessage = ContactMessageRow & { handler?: { full_name: string | null; email: string } | null };

export const CONTACT_STATUSES = ["new", "read", "replied", "archived"] as const satisfies readonly ContactStatus[];
export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = { new: "Mới", read: "Đã đọc", replied: "Đã trả lời", archived: "Lưu trữ" };
export const CONTACT_TOPIC_LABEL: Record<string, string> = { support: "Hỗ trợ sử dụng", billing: "Thanh toán & hoá đơn", partnership: "Hợp tác / Affiliate", feedback: "Góp ý sản phẩm", other: "Khác" };
