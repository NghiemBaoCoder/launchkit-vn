import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNext } from "@/lib/auth-utils";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const settings = await getSiteSettings();
  return <RegisterForm next={safeNext(sp.next)} registrationEnabled={settings.registration_enabled} />;
}
