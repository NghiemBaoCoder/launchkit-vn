import Link from "next/link";
import { MaintenanceGate } from "@/components/app/maintenance-gate";
import { BrandMark } from "@/components/app/brand-mark";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";

export default async function WizardLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSiteSettings()]);
  return (
    <MaintenanceGate>
      <div className="surface-glow flex min-h-dvh flex-col">
        <header className="container-x flex h-16 items-center justify-between">
          <BrandMark brand={{ name: settings.site_name, logoUrl: settings.logo_url }} />
          {user ? <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button> : <Button asChild variant="ghost" size="sm"><Link href="/login?next=/onboarding">Đăng nhập</Link></Button>}
        </header>
        <main className="container-x flex-1 pb-16 pt-4">{children}</main>
      </div>
    </MaintenanceGate>
  );
}
