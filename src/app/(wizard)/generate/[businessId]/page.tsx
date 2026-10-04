import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile, isAdminRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GenerationProgress } from "@/components/generation/generation-progress";

export const metadata: Metadata = { title: "Đang tạo Business Kit" };

export default async function GeneratePage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const profile = await requireProfile(`/generate/${businessId}`);
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id, name, user_id, status").eq("id", businessId).maybeSingle();
  if (!business || (business.user_id !== profile.id && !isAdminRole(profile.role))) notFound();
  const { data: job } = await supabase.from("generation_jobs").select("*").eq("business_id", businessId).eq("type", "full").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <GenerationProgress initialJob={job ?? null} businessId={business.id} businessName={business.name} credits={profile.credits} />;
}
