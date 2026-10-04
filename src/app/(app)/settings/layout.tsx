import { SettingsTabs } from "@/components/settings/settings-tabs";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader title="Cài đặt tài khoản" description="Quản lý hồ sơ, bảo mật, thông báo và chương trình giới thiệu bạn bè." />
      <SettingsTabs />
      {children}
    </div>
  );
}
