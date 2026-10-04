import { createClient } from "@/lib/supabase/server";
import { getBusinessOrNotFound } from "@/lib/data/business";
import { getBusinessTypes, getIndustries } from "@/lib/data/catalog";
import { requireProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessSettings } from "@/components/workspace/business-settings";

export const metadata = { title: "Cài đặt business" };

export default async function BusinessSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, business, businessTypes, industries, supabase] = await Promise.all([requireProfile(), getBusinessOrNotFound(id), getBusinessTypes(), getIndustries(), createClient()]);
  const { data: share } = await supabase.from("shares").select("*").eq("business_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (
    <div className="space-y-6">
      <PageHeader title="Cài đặt business" description="Thông tin, logo, liên hệ, chia sẻ và quản lý vòng đời business." />
      <BusinessSettings business={business} businessTypes={businessTypes} industries={industries} share={share ?? null} appUrl={env.appUrl} userId={profile.id} />
    </div>
  );
}
