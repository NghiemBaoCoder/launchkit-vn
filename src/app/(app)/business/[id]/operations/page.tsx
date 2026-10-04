import Link from "next/link";
import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { ChecklistBoard } from "@/components/workspace/checklist-board";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Vận hành" };

const KIND_ORDER = ["launch", "daily", "weekly", "customer_workflow", "sales_workflow", "delivery_workflow"] as const;
const KIND_LABEL: Record<string, string> = { launch: "Ra mắt", daily: "Hàng ngày", weekly: "Hàng tuần", customer_workflow: "Quy trình khách hàng", sales_workflow: "Quy trình bán hàng", delivery_workflow: "Quy trình bàn giao" };

export default async function OperationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, supabase] = await Promise.all([getAccessContext(id), createClient()]);
  const [{ data: checklists }, { data: items }] = await Promise.all([
    supabase.from("checklists").select("*").eq("business_id", id),
    supabase.from("checklist_items").select("*").eq("business_id", id).order("sort_order"),
  ]);
  const sorted = (checklists ?? []).sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const full = can(ctx, "operations.full");
  const freeKinds = new Set<string>(FREE_PREVIEW.checklistsVisible);
  const visible = full ? sorted : sorted.filter((c) => freeKinds.has(c.kind));
  const locked = full ? [] : sorted.filter((c) => !freeKinds.has(c.kind));

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vận hành" description="Checklist và quy trình để business chạy đều mỗi ngày." />
        <EmptyState icon={ListChecks} title="Chưa có checklist" description="Chạy trình tạo Business Kit để có 6 checklist & quy trình." action={<Button asChild><Link href={`/generate/${id}`}>Tạo Business Kit</Link></Button>} />
      </div>
    );
  }

  const board = (list: typeof sorted) => (
    <Tabs defaultValue={list[0]?.kind}>
      <TabsList>{list.map((c) => <TabsTrigger key={c.id} value={c.kind}>{KIND_LABEL[c.kind] ?? c.kind}</TabsTrigger>)}</TabsList>
      {list.map((c) => <TabsContent key={c.id} value={c.kind}><ChecklistBoard checklist={c} items={(items ?? []).filter((i) => i.checklist_id === c.id)} /></TabsContent>)}
    </Tabs>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Vận hành" description="Đánh dấu, thêm, sửa, sắp xếp và đặt lại checklist. Trạng thái được lưu tự động." actions={<RegenerateButton businessId={id} stage="operations" label="Tạo lại checklist" warning="Toàn bộ checklist và trạng thái hoàn thành sẽ được tạo lại." freeRegeneration={can(ctx, "generation.regenerate_free")} />} />
      {full ? board(sorted) : (
        <PremiumGate ctx={ctx} feature="operations.full" businessId={id} title={`Mở khoá ${locked.length} checklist & quy trình còn lại`} description="Gói miễn phí có checklist Ra mắt. Business Kit có thêm checklist hàng ngày, hàng tuần và 3 quy trình khách hàng – bán hàng – bàn giao." benefits={locked.map((c) => KIND_LABEL[c.kind] ?? c.kind)} teaserLines={5} preview={board(visible)}>
          {board(sorted)}
        </PremiumGate>
      )}
    </div>
  );
}
