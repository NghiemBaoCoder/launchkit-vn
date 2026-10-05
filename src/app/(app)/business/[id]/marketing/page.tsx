import Link from "next/link";
import { Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBusinessAssets } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { AssetCard } from "@/components/workspace/asset-card";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { MarketingPlan } from "@/components/workspace/marketing-plan";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Marketing" };

const ORDER = ["overview", "target_audience", "channels", "launch_strategy", "campaign_ideas", "promotions", "lead_magnets"];
const FREE_KEYS = new Set(["overview", "target_audience"]);
const DESCRIPTIONS: Record<string, string> = {
  overview: "Mục tiêu, KPI và ngân sách 90 ngày đầu.",
  target_audience: "3 phân khúc khách hàng và thông điệp cho từng nhóm.",
  channels: "Vai trò và chiến thuật cho từng kênh.",
  launch_strategy: "4 giai đoạn ra mắt trong 90 ngày.",
  campaign_ideas: "5 ý tưởng chiến dịch sẵn sàng triển khai.",
  promotions: "Chương trình khuyến mãi có điều kiện & thời hạn.",
  lead_magnets: "Quà tặng để đổi lấy thông tin liên hệ.",
};

export default async function MarketingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, ctx, supabase] = await Promise.all([getBusinessAssets(id, "marketing"), getAccessContext(id), createClient()]);
  const full = can(ctx, "marketing.full");
  const freeRegen = can(ctx, "generation.regenerate_free");
  const { data: plan } = await supabase.from("marketing_plan_items").select("*").eq("business_id", id).order("day_index");
  const sorted = [...assets].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const freeAssets = sorted.filter((a) => FREE_KEYS.has(a.key));
  const premiumAssets = sorted.filter((a) => !FREE_KEYS.has(a.key));
  const previewPlan = (plan ?? []).filter((p) => p.day_index <= FREE_PREVIEW.marketingDaysVisible);

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Marketing" description="Kênh, chiến lược ra mắt và kế hoạch 30 ngày." />
        <EmptyState icon={Megaphone} title="Chưa có kế hoạch marketing" description="Chạy trình tạo Business Kit để có kế hoạch 30 ngày và ý tưởng chiến dịch." action={<Button asChild><Link href={`/generate/${id}`}>Tạo Business Kit</Link></Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Marketing" description="Tổng quan, khách hàng mục tiêu, kênh, chiến lược ra mắt và kế hoạch 30 ngày." actions={<RegenerateButton businessId={id} stage="marketing" label="Tạo lại marketing" warning="Kế hoạch 30 ngày sẽ được tạo lại (trạng thái hoàn thành bị đặt lại)." freeRegeneration={freeRegen} />} />
      <div className="grid gap-4 lg:grid-cols-2">{freeAssets.map((a) => <AssetCard key={a.id} asset={a} businessId={id} stage="marketing" freeRegeneration={freeRegen} description={DESCRIPTIONS[a.key]} />)}</div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Kế hoạch 30 ngày</h2>
        <PremiumGate ctx={ctx} feature="marketing.full" businessId={id} title="Kế hoạch marketing 30 ngày đầy đủ" description="Xem trước 7 ngày đầu. Mở khoá để có toàn bộ 30 ngày, đánh dấu hoàn thành và tuỳ chỉnh." teaserLines={5} preview={<MarketingPlan businessId={id} items={previewPlan} readOnly limitNote={`xem trước ${FREE_PREVIEW.marketingDaysVisible}/${plan?.length ?? 30} ngày`} />}>
          <MarketingPlan businessId={id} items={plan ?? []} />
        </PremiumGate>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Chiến lược & ý tưởng</h2>
        <PremiumGate ctx={ctx} feature="marketing.full" businessId={id} title="Kênh, chiến lược ra mắt, chiến dịch, khuyến mãi & lead magnet" description="5 nội dung chiến lược giúp bạn có khách đều đặn từ tháng đầu." benefits={["Chiến thuật cụ thể cho từng kênh bạn chọn", "Lộ trình ra mắt 4 giai đoạn", "5 chiến dịch + 4 khuyến mãi + 3 lead magnet"]} teaserLines={8}>
          <div className="grid gap-4 lg:grid-cols-2">{premiumAssets.map((a) => <AssetCard key={a.id} asset={a} businessId={id} stage="marketing" freeRegeneration={freeRegen} description={DESCRIPTIONS[a.key]} className={a.key === "channels" || a.key === "launch_strategy" ? "lg:col-span-2" : undefined} />)}</div>
        </PremiumGate>
      </section>
      {!full ? null : null}
    </div>
  );
}
