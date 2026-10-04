import { createClient } from "@/lib/supabase/server";
import { getBusinessOrNotFound } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { WebsiteStudio } from "@/components/workspace/website-studio";
import { SiteRenderer, type SiteContact, type SiteTheme } from "@/components/site-template/site-renderer";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { WebsiteSection } from "@/lib/ai/types";

export const metadata = { title: "Website Kit" };

export default async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, ctx, supabase] = await Promise.all([getBusinessOrNotFound(id), getAccessContext(id), createClient()]);
  const { data: site } = await supabase.from("website_sites").select("*").eq("business_id", id).maybeSingle();
  const freeRegen = can(ctx, "generation.regenerate_free");

  if (!site) {
    return (
      <div className="space-y-6">
        <PageHeader title="Website Kit" description="Studio dựng landing page 12 section và trang public." />
        <EmptyState icon={Globe} title="Chưa có website" description="Chạy trình tạo Business Kit để có landing page từ nội dung thương hiệu & dịch vụ." action={<Button asChild><Link href={`/generate/${id}`}>Tạo Business Kit</Link></Button>} />
      </div>
    );
  }

  const sections = (site.sections as unknown as WebsiteSection[]) ?? [];
  const theme = site.theme as unknown as SiteTheme;
  const contact = (site.contact as SiteContact) ?? {};

  return (
    <div className="space-y-6">
      <PageHeader title="Website Kit" description="Chỉnh copy, bật/tắt và sắp xếp section, đổi màu, CTA và liên hệ — rồi xuất bản trang public." actions={<RegenerateButton businessId={id} stage="website" label="Tạo lại website" warning="Toàn bộ section sẽ được tạo lại từ thương hiệu hiện tại (liên hệ được giữ)." freeRegeneration={freeRegen} />} />
      <PremiumGate
        ctx={ctx}
        feature="website.kit"
        businessId={id}
        title="Website Kit thuộc gói Business Kit Pro"
        description="Xem trước trang hero bên dưới. Mở khoá để dùng studio: chỉnh sửa, đổi màu, sắp xếp section và xuất bản tại /site/<slug>."
        benefits={["Studio desktop/mobile với 12 section", "Đổi màu, font, CTA, thông tin liên hệ", "Trang public /site/" + site.slug]}
        teaserLines={4}
        preview={<div className="overflow-hidden rounded-xl border"><div className="pointer-events-none max-h-[420px] overflow-hidden"><SiteRenderer business={business} sections={sections.filter((s) => s.type === "hero" || s.type === "about")} theme={theme} contact={contact} /></div></div>}
      >
        <WebsiteStudio businessId={id} site={site} business={{ name: business.name, logo_url: business.logo_url }} appUrl={env.appUrl} />
      </PremiumGate>
    </div>
  );
}
