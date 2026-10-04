import { createClient } from "@/lib/supabase/server";
import { getBusinessAssets, getBusinessOrNotFound } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { PricingPackages } from "@/components/workspace/pricing-packages";
import { PricingCalculators } from "@/components/workspace/pricing-calculators";
import { AssetCard } from "@/components/workspace/asset-card";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVND } from "@/lib/utils";

export const metadata = { title: "Bảng giá" };

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, ctx, assets, supabase] = await Promise.all([getBusinessOrNotFound(id), getAccessContext(id), getBusinessAssets(id, "pricing"), createClient()]);
  const [{ data: packages }, { data: services }] = await Promise.all([
    supabase.from("pricing_packages").select("*").eq("business_id", id).order("sort_order"),
    supabase.from("services").select("*").eq("business_id", id).eq("active", true).order("sort_order"),
  ]);
  const recommendations = assets.find((a) => a.key === "recommendations");
  const calculator = assets.find((a) => a.key === "calculator_defaults");
  const anchor = (recommendations?.content as { anchor?: number } | undefined)?.anchor ?? packages?.find((p) => p.recommended)?.price ?? packages?.[0]?.price ?? 0;
  const freeRegen = can(ctx, "generation.regenerate_free");
  const rec = recommendations?.content as { strategy?: string; tips?: string[]; units_needed?: number; revenue_target?: number } | undefined;

  return (
    <div className="space-y-8">
      <PageHeader title="Bảng giá" description="3 gói giá, bảng so sánh và máy tính chi phí / biên lợi nhuận." actions={<RegenerateButton businessId={id} stage="pricing" label="Tạo lại bảng giá" warning="3 gói Cơ bản/Tiêu chuẩn/Cao cấp sẽ được tạo lại (gói tuỳ chỉnh được giữ)." freeRegeneration={freeRegen} />} />
      <PricingPackages businessId={id} packages={packages ?? []} services={services ?? []} businessName={business.name} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Khuyến nghị định giá</h2>
        <PremiumGate
          ctx={ctx}
          feature="pricing.full"
          businessId={id}
          title="Chiến lược định giá đầy đủ"
          description="Mở khoá Business Kit để xem chiến lược, mẹo tâm lý giá và số đơn cần đạt mục tiêu doanh thu."
          benefits={["Chiến lược giá theo giá trị", "5 mẹo tăng giá không mất khách", "Máy tính chi phí & biên lợi nhuận"]}
          preview={rec ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Tóm tắt</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{rec.strategy?.split(".")[0]}.</p>
                {rec.units_needed && rec.revenue_target ? <p>Để đạt <strong>{formatVND(rec.revenue_target)}/tháng</strong> cần khoảng <strong>{rec.units_needed}</strong> đơn gói Tiêu chuẩn.</p> : null}
              </CardContent>
            </Card>
          ) : null}
        >
          {recommendations ? <AssetCard asset={recommendations} businessId={id} stage="pricing" freeRegeneration={freeRegen} /> : <p className="text-sm text-muted-foreground">Chưa có khuyến nghị. Hãy tạo lại bảng giá.</p>}
        </PremiumGate>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Máy tính chi phí & biên lợi nhuận</h2>
        <PremiumGate ctx={ctx} feature="pricing.calculators" businessId={id} title="Máy tính định giá" description="Tính giá vốn, giá bán gợi ý và biên lợi nhuận cho từng gói — lưu lại để dùng dần." teaserLines={4}>
          <PricingCalculators asset={calculator} anchorPrice={anchor} />
        </PremiumGate>
      </section>
    </div>
  );
}
