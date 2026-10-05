import { DefaultNav } from "@/components/app/default-nav";
import { getCurrentProfile, isAdminRole } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { createClient } from "@/lib/supabase/server";

export default async function SidebarDefault() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const ctx = await getAccessContext();
  let canCreate = can(ctx, "business.multiple");
  if (!canCreate) {
    const supabase = await createClient();
    const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived");
    canCreate = (count ?? 0) < 1;
  }
  return <DefaultNav isAdmin={isAdminRole(profile.role)} canCreate={canCreate} />;
}
