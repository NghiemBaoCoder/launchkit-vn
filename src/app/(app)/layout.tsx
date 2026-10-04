import { MaintenanceGate } from "@/components/app/maintenance-gate";
import { AppShell } from "@/components/app/app-shell";
import { requireProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children, sidebar }: { children: React.ReactNode; sidebar?: React.ReactNode }) {
  const profile = await requireProfile();
  const [ctx, supabase] = await Promise.all([getAccessContext(), createClient()]);
  const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", profile.id).is("read_at", null);
  return (
    <MaintenanceGate>
    <AppShell profile={profile} plan={ctx.plan} unread={count ?? 0} sidebar={sidebar}>
      {children}
    </AppShell>
    </MaintenanceGate>
  );
}
