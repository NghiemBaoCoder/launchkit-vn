import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { BreakEvenTool, MonthlyExpensesTool, ProfitTool, RevenueTargetTool, StartupCostTool } from "@/components/workspace/finance-tools";
import { can } from "@/lib/access/policy";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const metadata = { title: "Tài chính" };

export default async function FinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, supabase] = await Promise.all([getAccessContext(id), createClient()]);
  const { data: rows } = await supabase.from("finance_calculations").select("type, data").eq("business_id", id);
  const get = <T,>(type: string): T | null => ((rows ?? []).find((r) => r.type === type)?.data as T | undefined) ?? null;
  return (
    <div className="space-y-6">
      <PageHeader title="Tài chính" description="Chi phí khởi nghiệp, chi phí hàng tháng, mục tiêu doanh thu, lợi nhuận và điểm hoà vốn. Mọi phép tính được lưu lại." actions={<RegenerateButton businessId={id} stage="finance" label="Tạo lại số liệu gợi ý" warning="Các máy tính sẽ được đặt lại theo gợi ý của ngành (số bạn đã nhập sẽ bị ghi đè)." freeRegeneration={can(ctx, "generation.regenerate_free")} />} />
      <Alert variant="info"><Info /><AlertDescription>Các con số là ước tính tham khảo để bạn lập kế hoạch, không phải tư vấn tài chính, thuế hay pháp lý.</AlertDescription></Alert>
      <div className="grid gap-4 lg:grid-cols-2">
        <StartupCostTool businessId={id} initial={get("startup_cost")} />
        <MonthlyExpensesTool businessId={id} initial={get("monthly_expenses")} />
        <div className="lg:col-span-2"><RevenueTargetTool businessId={id} initial={get("revenue_target")} /></div>
      </div>
      <PremiumGate ctx={ctx} feature="finance.advanced" businessId={id} title="Ước tính lợi nhuận & điểm hoà vốn" description="Mở khoá để mô phỏng lợi nhuận ròng theo kịch bản doanh thu và biết cần bao nhiêu đơn để hoà vốn." teaserLines={4}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ProfitTool businessId={id} initial={get("profit")} />
          <BreakEvenTool businessId={id} initial={get("break_even")} />
        </div>
      </PremiumGate>
    </div>
  );
}
