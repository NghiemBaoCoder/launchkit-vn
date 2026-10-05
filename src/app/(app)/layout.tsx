import { MaintenanceGate } from "@/components/app/maintenance-gate";
import { AppShell } from "@/components/app/app-shell";
import { BackgroundGeneration, type ActiveJob } from "@/components/app/background-generation";
import { requireProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/data/settings";

export default async function AppLayout({ children, sidebar }: { children: React.ReactNode; sidebar?: React.ReactNode }) {
  const profile = await requireProfile();
  const [ctx, supabase, settings] = await Promise.all([getAccessContext(), createClient(), getSiteSettings()]);
  const [{ count: unread }, { data: jobs }, { count: activeBusinesses }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", profile.id).is("read_at", null),
    supabase.from("generation_jobs").select("id, business_id, businesses(name)").eq("user_id", profile.id).in("status", ["pending", "processing"]).order("created_at", { ascending: false }).limit(3),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived"),
  ]);
  const activeJobs: ActiveJob[] = (jobs ?? []).map((j) => ({ id: j.id, businessId: j.business_id, businessName: (j.businesses as { name: string } | null)?.name ?? "Business" }));
  const canCreate = can(ctx, "business.multiple") || (activeBusinesses ?? 0) < 1;
  return (
    <MaintenanceGate>
      <AppShell profile={profile} plan={ctx.plan} unread={unread ?? 0} brand={{ name: settings.site_name, logoUrl: settings.logo_url }} canCreate={canCreate} sidebar={sidebar}>
        {children}
      </AppShell>
      <BackgroundGeneration jobs={activeJobs} />
    </MaintenanceGate>
  );
}
