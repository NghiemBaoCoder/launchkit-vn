import Link from "next/link";
import { Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/data/settings";
import { getCurrentProfile, isAdminRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/**
 * Chế độ bảo trì (admin bật trong /admin/settings): khách và user thường thấy trang thông báo,
 * admin vẫn truy cập bình thường để kiểm tra.
 */
export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  if (!settings.maintenance_mode) return <>{children}</>;
  const profile = await getCurrentProfile();
  if (profile && isAdminRole(profile.role)) {
    return (
      <>
        <div className="bg-warning px-4 py-1.5 text-center text-xs font-medium text-warning-foreground">Chế độ bảo trì đang bật — chỉ admin nhìn thấy nội dung này. Tắt trong Quản trị → Cài đặt.</div>
        {children}
      </>
    );
  }
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-warning/20 text-warning-foreground"><Wrench className="size-8" /></div>
      <h1 className="text-3xl font-bold">{settings.site_name} đang bảo trì</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Chúng tôi đang nâng cấp hệ thống và sẽ quay lại sớm. Dữ liệu của bạn vẫn an toàn. Cần hỗ trợ gấp? Email <a className="text-primary hover:underline" href={`mailto:${settings.support_email}`}>{settings.support_email}</a>.</p>
      <Button asChild variant="outline" className="mt-6"><Link href="/login">Đăng nhập (dành cho quản trị)</Link></Button>
    </div>
  );
}
