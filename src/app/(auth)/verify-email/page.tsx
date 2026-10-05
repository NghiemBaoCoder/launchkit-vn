import type { Metadata } from "next";
import { VerifyEmail } from "@/components/auth/verify-email";

export const metadata: Metadata = { title: "Xác thực email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; verified?: string }> }) {
  const sp = await searchParams;
  return <VerifyEmail email={sp.email} verified={sp.verified === "1"} />;
}
