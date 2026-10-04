import { z } from "zod";

/** Số điện thoại VN (lỏng): 0xxxxxxxxx hoặc +84xxxxxxxxx, cho phép khoảng trắng/chấm/gạch khi nhập. */
const PHONE_RE = /^(\+?84|0)\d{8,10}$/;

/** Bỏ khoảng trắng, dấu chấm, gạch ngang, ngoặc trong số điện thoại. */
export function normalizePhone(v: string | null | undefined): string {
  return (v ?? "").replace(/[\s.\-()]/g, "");
}

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(80, "Họ tên tối đa 80 ký tự"),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại quá dài")
    .refine((v) => v === "" || PHONE_RE.test(normalizePhone(v)), "Số điện thoại không hợp lệ (VD: 0912 345 678 hoặc +84 912 345 678)"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Nhập mật khẩu hiện tại"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Mật khẩu nhập lại không khớp", path: ["confirm"] });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const NOTIFICATION_PREF_KEYS = ["email_marketing", "product_updates", "payment_updates", "generation_updates"] as const;
export type NotificationPrefKey = (typeof NOTIFICATION_PREF_KEYS)[number];
export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email_marketing: true,
  product_updates: true,
  payment_updates: true,
  generation_updates: true,
};

export const NOTIFICATION_PREF_META: Record<NotificationPrefKey, { label: string; description: string }> = {
  email_marketing: { label: "Email marketing & mẹo", description: "Mẹo khởi nghiệp, ưu đãi và nội dung hữu ích từ LaunchKit (1–2 email mỗi tháng)." },
  product_updates: { label: "Cập nhật sản phẩm", description: "Tính năng mới, template mới và các thay đổi quan trọng của nền tảng." },
  payment_updates: { label: "Thanh toán & hoá đơn", description: "Xác nhận đơn hàng, hoá đơn, gia hạn gói và cảnh báo sắp hết hạn." },
  generation_updates: { label: "Tạo nội dung hoàn tất", description: "Báo khi Business Kit hoặc tài liệu của bạn đã được tạo xong." },
};

export const notificationPrefsSchema = z.strictObject({
  email_marketing: z.boolean().optional(),
  product_updates: z.boolean().optional(),
  payment_updates: z.boolean().optional(),
  generation_updates: z.boolean().optional(),
});

/** Gộp jsonb `notification_prefs` (có thể thiếu key hoặc sai kiểu) với giá trị mặc định. */
export function normalizePrefs(raw: unknown): NotificationPrefs {
  const out: NotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS };
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const key of NOTIFICATION_PREF_KEYS) {
      const v = (raw as Record<string, unknown>)[key];
      if (typeof v === "boolean") out[key] = v;
    }
  }
  return out;
}
