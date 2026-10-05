import { MaintenanceGate } from "@/components/app/maintenance-gate";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { SITE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function WizardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <MaintenanceGate>
    <div className="surface-glow flex min-h-dvh flex-col">
      <header className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="size-4" /></span>
          {SITE.name}
        </Link>
        {user ? <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button> : <Button asChild variant="ghost" size="sm"><Link href="/login?next=/onboarding">Đăng nhập</Link></Button>}
      </header>
      <main className="container-x flex-1 pb-16 pt-4">{children}</main>
    </div>
    </MaintenanceGate>
  );
}
