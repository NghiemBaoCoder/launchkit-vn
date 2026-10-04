import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AnalyticsTracker event="landing_view" />
    </div>
  );
}
