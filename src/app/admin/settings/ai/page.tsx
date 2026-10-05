import { PageHeader } from "@/components/ui/page-header";
import { AiSettingsForm } from "@/components/admin/settings/ai-settings-form";
import { getAiSettingsAdminView } from "@/lib/data/admin-settings";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Cài đặt AI" };

export default async function AdminAiSettingsPage() {
  const { settings, meta, hasAnthropicKey, envProvider } = await getAiSettingsAdminView();
  return (
    <div className="space-y-6">
      <PageHeader title="Cài đặt AI" description={meta.updatedAt ? `Cập nhật ${formatDateTime(meta.updatedAt)}${meta.updatedBy ? ` bởi ${meta.updatedBy.full_name || meta.updatedBy.email}` : ""}.` : "Đang dùng giá trị mặc định."} />
      <AiSettingsForm settings={settings} hasAnthropicKey={hasAnthropicKey} envProvider={envProvider} />
    </div>
  );
}
