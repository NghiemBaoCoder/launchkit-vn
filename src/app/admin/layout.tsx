import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị LaunchKit VN" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Kiểm tra quyền trên DB (không tin JWT). Không phải admin → /403.
  const profile = await requireAdmin();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
