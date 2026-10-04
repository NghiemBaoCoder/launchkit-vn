import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export class AuthError extends Error {
  constructor(message = "Bạn cần đăng nhập để tiếp tục.", public code: "unauthenticated" | "forbidden" | "suspended" = "unauthenticated") {
    super(message);
  }
}

/** Người dùng đăng nhập hiện tại (null nếu khách). Được cache theo request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

/** Profile hiện tại (null nếu khách). Được cache theo request. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ?? null;
});

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "admin" || role === "super_admin";
}

/** Bắt buộc đăng nhập (dùng trong page/layout): redirect sang /login kèm next. */
export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  }
  return user;
}

/** Bắt buộc đăng nhập + profile hợp lệ (không bị khoá). */
export async function requireProfile(nextPath?: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  }
  if (profile.status === "suspended") {
    redirect("/suspended");
  }
  return profile;
}

/** Dùng trong server actions: ném lỗi thay vì redirect. */
export async function requireProfileAction(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AuthError();
  if (profile.status === "suspended") throw new AuthError("Tài khoản của bạn đã bị tạm khoá.", "suspended");
  return profile;
}

/** Bắt buộc quyền admin — kiểm tra trên DB, không tin JWT. */
export async function requireAdmin(options?: { superOnly?: boolean }): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!isAdminRole(profile.role) || profile.status !== "active") redirect("/403");
  if (options?.superOnly && profile.role !== "super_admin") redirect("/403");
  return profile;
}

export async function requireAdminAction(options?: { superOnly?: boolean }): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AuthError();
  if (!isAdminRole(profile.role) || profile.status !== "active") throw new AuthError("Bạn không có quyền truy cập.", "forbidden");
  if (options?.superOnly && profile.role !== "super_admin") throw new AuthError("Chỉ super admin mới thực hiện được thao tác này.", "forbidden");
  return profile;
}
