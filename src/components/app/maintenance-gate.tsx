import { getSiteSettings } from "@/lib/data/settings";
import { MaintenanceScreen } from "./maintenance-screen";

/**
 * Chế độ bảo trì (admin bật trong /admin/settings): khách và user thường thấy trang thông báo,
 * admin vẫn truy cập bình thường để kiểm tra. Việc nhận diện admin làm ở trình duyệt (claims JWT)
 * để layout public không phải đọc cookie → vẫn prerender/ISR được.
 */
export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  if (!settings.maintenance_mode) return <>{children}</>;
  return (
    <MaintenanceScreen siteName={settings.site_name} supportEmail={settings.support_email}>
      {children}
    </MaintenanceScreen>
  );
}
