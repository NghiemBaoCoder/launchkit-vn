import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Đặt lại mật khẩu" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  return <ResetPasswordForm hasSession={!!user} />;
}
