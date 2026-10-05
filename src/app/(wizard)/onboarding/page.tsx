import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getBusinessTypes, getIndustries } from "@/lib/data/catalog";
import { getCurrentProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingDraft } from "@/lib/onboarding/schema";

export const metadata: Metadata = { title: "Tạo Business Kit", description: "Trả lời 10 câu hỏi ngắn để nhận Business Kit hoàn chỉnh bằng tiếng Việt." };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const [businessTypes, industries, profile] = await Promise.all([getBusinessTypes(), getIndustries(), getCurrentProfile()]);
  let canCreateMore = true;
  if (profile) {
    const ctx = await getAccessContext();
    if (!can(ctx, "business.multiple")) {
      const supabase = await createClient();
      const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived");
      canCreateMore = (count ?? 0) < 1;
    }
  }
  const presetType = sp.type && businessTypes.some((b) => b.slug === sp.type) ? sp.type : undefined;
  return (
    <OnboardingWizard
      businessTypes={businessTypes}
      industries={industries}
      isLoggedIn={!!profile}
      serverDraft={(profile?.onboarding_draft as OnboardingDraft | null) ?? null}
      presetType={presetType}
      canCreateMore={canCreateMore}
    />
  );
}
