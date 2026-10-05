import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { getSiteSettings } from "@/lib/data/settings";
import { countNewMessages } from "@/lib/data/admin-messages";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị LaunchKit VN" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Kiểm tra quyền trên DB (không tin JWT). Không phải admin → /403.
  const profile = await requireAdmin();
  const [ctx, settings, newMessages] = await Promise.all([getAccessContext(), getSiteSettings(), countNewMessages().catch(() => 0)]);
  return (
    <AdminShell profile={profile} plan={ctx.plan} brand={{ name: settings.site_name, logoUrl: settings.logo_url }} newMessages={newMessages}>
      {children}
    </AdminShell>
  );
}
