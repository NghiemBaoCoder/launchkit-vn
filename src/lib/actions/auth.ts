"use server";

import { z } from "zod";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/data/settings";
import { fail, ok, type ActionResult } from "@/types";
import { safeNext } from "@/lib/auth-utils";

const emailSchema = z.string().trim().email("Email không hợp lệ").max(120);
const passwordSchema = z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72);

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email hoặc mật khẩu không đúng.";
  if (m.includes("email not confirmed")) return "Email chưa được xác thực. Vui lòng kiểm tra hộp thư.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "Email này đã được đăng ký. Hãy đăng nhập.";
  if (m.includes("password should be")) return "Mật khẩu quá yếu. Dùng ít nhất 8 ký tự.";
  if (m.includes("rate limit") || m.includes("too many")) return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  if (m.includes("same password")) return "Mật khẩu mới phải khác mật khẩu cũ.";
  if (m.includes("session") && m.includes("missing")) return "Liên kết đã hết hạn. Vui lòng yêu cầu lại.";
  return message || "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export async function signInAction(input: { email: string; password: string; next?: string }): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1, "Nhập mật khẩu") }).safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return fail(translateAuthError(error.message), "auth");
  const status = (data.user?.app_metadata as { status?: string } | undefined)?.status;
  if (status === "suspended") return ok({ redirectTo: "/suspended" });
  await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);
  return ok({ redirectTo: safeNext(input.next) });
}

export async function signUpAction(input: { fullName: string; email: string; password: string; next?: string }): Promise<ActionResult<{ redirectTo: string; needsVerification: boolean }>> {
  const settings = await getSiteSettings();
  if (!settings.registration_enabled) return fail("Hệ thống đang tạm ngưng đăng ký mới. Vui lòng quay lại sau.", "registration_disabled");
  const parsed = z.object({ fullName: z.string().trim().min(2, "Nhập họ tên").max(80), email: emailSchema, password: passwordSchema }).safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);

  const cookieStore = await cookies();
  const referral = cookieStore.get("lk_ref")?.value ?? "";
  const next = safeNext(input.next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, referral_code: referral },
      emailRedirectTo: `${env.appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return fail(translateAuthError(error.message), "auth");
  // Supabase trả về user có identities rỗng khi email đã tồn tại (để chống dò email)
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return fail("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng quên mật khẩu.", "exists");
  }
  if (data.session) {
    return ok({ redirectTo: next, needsVerification: false });
  }
  return ok({ redirectTo: `/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`, needsVerification: true });
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOutOthersAction(): Promise<ActionResult<undefined>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) return fail(translateAuthError(error.message));
  return ok(undefined, "Đã đăng xuất khỏi các thiết bị khác.");
}

export async function forgotPasswordAction(input: { email: string }): Promise<ActionResult<undefined>> {
  const parsed = z.object({ email: emailSchema }).safeParse(input);
  if (!parsed.success) return fail("Email không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${env.appUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}` });
  if (error) return fail(translateAuthError(error.message));
  return ok(undefined, "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.");
}

export async function resetPasswordAction(input: { password: string; confirm: string }): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = z
    .object({ password: passwordSchema, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Mật khẩu nhập lại không khớp", path: ["confirm"] })
    .safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return fail("Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.", "expired");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(translateAuthError(error.message));
  return ok({ redirectTo: "/dashboard" }, "Đã cập nhật mật khẩu.");
}

export async function changePasswordAction(input: { current: string; password: string; confirm: string }): Promise<ActionResult<undefined>> {
  const parsed = z
    .object({ current: z.string().min(1, "Nhập mật khẩu hiện tại"), password: passwordSchema, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Mật khẩu nhập lại không khớp", path: ["confirm"] })
    .safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) return fail("Bạn cần đăng nhập.", "unauthenticated");
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: userData.user.email, password: parsed.data.current });
  if (verifyError) return fail("Mật khẩu hiện tại không đúng.", "validation", { current: ["Mật khẩu hiện tại không đúng."] });
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(translateAuthError(error.message));
  return ok(undefined, "Đã đổi mật khẩu.");
}

export async function resendVerificationAction(input: { email: string }): Promise<ActionResult<undefined>> {
  const parsed = z.object({ email: emailSchema }).safeParse(input);
  if (!parsed.success) return fail("Email không hợp lệ");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${env.appUrl}/auth/callback` } });
  if (error) return fail(translateAuthError(error.message));
  return ok(undefined, "Đã gửi lại email xác thực.");
}

export async function googleSignInAction(next?: string): Promise<ActionResult<{ url: string }>> {
  if (!env.googleOAuthEnabled) return fail("Đăng nhập Google chưa được cấu hình.", "disabled");
  const supabase = await createClient();
  const h = await headers();
  const origin = h.get("origin") ?? env.appUrl;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
  });
  if (error || !data.url) return fail(translateAuthError(error?.message ?? "Không thể bắt đầu đăng nhập Google"));
  return ok({ url: data.url });
}
