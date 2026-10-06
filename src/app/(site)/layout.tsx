import * as React from "react";
import { MaintenanceGate } from "@/components/app/maintenance-gate";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getSiteSettings } from "@/lib/data/settings";

/**
 * Layout public: không đọc cookie/header trên server để toàn bộ trang (site) được
 * prerender / ISR. Trạng thái đăng nhập của header được xác định ở trình duyệt.
 * Tên site / logo lấy từ cài đặt admin (client public, cache theo ISR).
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const brand = { name: settings.site_name, logoUrl: settings.logo_url };
  return (
    <MaintenanceGate>
      <MotionProvider>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader brand={brand} />
          <main className="flex-1">{children}</main>
          <SiteFooter brand={brand} supportEmail={settings.support_email} />
          <React.Suspense fallback={null}>
            <AnalyticsTracker event="landing_view" />
          </React.Suspense>
        </div>
      </MotionProvider>
    </MaintenanceGate>
  );
}
