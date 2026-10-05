import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettingsAdminView } from "@/lib/data/admin-settings";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Cài đặt site" };

export default async function AdminSiteSettingsPage() {
  // Chỉ super admin — kiểm tra lại ở page (layout chỉ yêu cầu admin).
  await requireAdmin({ superOnly: true });
  const { settings, meta } = await getSiteSettingsAdminView();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt site"
        description={<span className="inline-flex flex-wrap items-center gap-2"><Badge variant="premium"><ShieldCheck /> Super admin</Badge>{meta.updatedAt ? <span>Cập nhật {formatDateTime(meta.updatedAt)}{meta.updatedBy ? ` bởi ${meta.updatedBy.full_name || meta.updatedBy.email}` : ""}</span> : <span>Đang dùng giá trị mặc định.</span>}</span>}
      />
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
