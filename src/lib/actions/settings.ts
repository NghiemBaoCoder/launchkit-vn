"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { env } from "@/lib/env";
import { fail, ok, type ActionResult, type JsonValue } from "@/types";
import { normalizePhone, normalizePrefs, notificationPrefsSchema, profileSchema, type NotificationPrefs, type ProfileInput } from "@/components/settings/schemas";

const AVATAR_PUBLIC_ROOT = `${env.supabaseUrl}/storage/v1/object/public/avatars/`;

/** Cập nhật họ tên / số điện thoại của chính mình (RLS cho phép; cột nhạy cảm được trigger bảo vệ). */
export async function updateProfileAction(input: ProfileInput): Promise<ActionResult<ProfileInput>> {
  const profile = await requireProfileAction();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const phone = normalizePhone(parsed.data.phone);

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name, phone: phone || null }).eq("id", profile.id);
  if (error) return fail(error.message);

  await logActivity({ userId: profile.id, action: "profile.updated", entityType: "profile", entityId: profile.id, title: "Cập nhật hồ sơ", metadata: { full_name: parsed.data.full_name } });
  revalidatePath("/", "layout");
  return ok({ full_name: parsed.data.full_name, phone }, "Đã lưu hồ sơ");
}

/**
 * Lưu URL ảnh đại diện (client đã upload lên bucket `avatars/<userId>/...`) hoặc gỡ ảnh (null).
 * Chỉ chấp nhận URL public thuộc thư mục của chính người dùng.
 */
export async function updateAvatarAction(url: string | null): Promise<ActionResult<{ avatar_url: string | null }>> {
  const profile = await requireProfileAction();
  const ownPrefix = `${AVATAR_PUBLIC_ROOT}${profile.id}/`;
  if (url !== null && (typeof url !== "string" || url.length > 500 || !url.startsWith(ownPrefix))) {
    return fail("Đường dẫn ảnh không hợp lệ", "validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
  if (error) return fail(error.message);

  // Dọn file cũ trong thư mục của người dùng (best-effort, policy owner delete).
  const previous = profile.avatar_url;
  if (previous && previous.startsWith(ownPrefix) && previous !== url) {
    try {
      await supabase.storage.from("avatars").remove([previous.slice(AVATAR_PUBLIC_ROOT.length)]);
    } catch {
      // bỏ qua: file cũ có thể đã bị xoá
    }
  }

  await logActivity({ userId: profile.id, action: "profile.avatar_updated", entityType: "profile", entityId: profile.id, title: url ? "Cập nhật ảnh đại diện" : "Gỡ ảnh đại diện" });
  revalidatePath("/", "layout");
  return ok({ avatar_url: url }, url ? "Đã cập nhật ảnh đại diện" : "Đã gỡ ảnh đại diện");
}

/** Gộp các tuỳ chọn thông báo được gửi lên vào jsonb `profiles.notification_prefs`. */
export async function updateNotificationPrefsAction(input: Partial<NotificationPrefs>): Promise<ActionResult<NotificationPrefs>> {
  const profile = await requireProfileAction();
  const parsed = notificationPrefsSchema.safeParse(input);
  if (!parsed.success) return fail("Tuỳ chọn không hợp lệ", "validation");

  const merged: NotificationPrefs = normalizePrefs(profile.notification_prefs);
  for (const [key, value] of Object.entries(parsed.data)) {
    if (typeof value === "boolean") merged[key as keyof NotificationPrefs] = value;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ notification_prefs: merged as JsonValue }).eq("id", profile.id);
  if (error) return fail(error.message);

  revalidatePath("/settings/notifications");
  return ok(merged, "Đã lưu tuỳ chọn thông báo");
}
