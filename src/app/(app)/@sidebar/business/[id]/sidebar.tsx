import { createClient } from "@/lib/supabase/server";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";

export async function BusinessSidebar({ id }: { id: string }) {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id, name, status, logo_url").eq("id", id).maybeSingle();
  if (!business) return null;
  return <WorkspaceNav business={business} />;
}
