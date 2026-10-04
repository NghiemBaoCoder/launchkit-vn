import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { DocumentsManager } from "@/components/workspace/documents-manager";
import { DOC_TYPES } from "@/lib/workspace/documents";
import { OutlineView } from "@/components/workspace/outline-view";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { documentOutline } from "@/lib/export/build";

export const metadata = { title: "Tài liệu" };

export default async function DocumentsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ doc?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [ctx, supabase] = await Promise.all([getAccessContext(id), createClient()]);
  const full = can(ctx, "documents.full");
  const { data: all } = await supabase.from("documents").select("*").eq("business_id", id).order("created_at");
  const allowedTypes = new Set<string>(full ? DOC_TYPES.map((t) => t.type) : [...FREE_PREVIEW.documentsVisible]);
  const docs = (all ?? []).filter((d) => allowedTypes.has(d.type));
  const lockedTypes = DOC_TYPES.map((t) => t.type).filter((t) => !allowedTypes.has(t));
  const selected = docs.find((d) => d.id === sp.doc) ?? docs[0] ?? null;
  const outline = selected ? documentOutline(selected) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Tài liệu" description="Báo giá, đề xuất, hợp đồng, brief, hoá đơn và form tiếp nhận — điền sẵn từ business của bạn." actions={<RegenerateButton businessId={id} stage="documents" label="Tạo lại bộ tài liệu" warning="Nội dung 6 tài liệu gốc sẽ được tạo lại theo thông tin hiện tại (bản sao và tài liệu bạn tự tạo được giữ)." freeRegeneration={can(ctx, "generation.regenerate_free")} />} />
      <DocumentsManager businessId={id} documents={docs} selected={selected} lockedTypes={lockedTypes} canExport={can(ctx, "exports.basic")} preview={outline ? <OutlineView title={outline.title} subtitle={outline.subtitle} blocks={outline.blocks} /> : null} />
      {!full ? (
        <PremiumGate ctx={ctx} feature="documents.full" businessId={id} title="Mở khoá 5 tài liệu còn lại" description="Đề xuất hợp tác, hợp đồng dịch vụ, brief khách hàng, hoá đơn và form tiếp nhận — cùng xuất PDF." benefits={lockedTypes.map((t) => DOC_TYPES.find((x) => x.type === t)?.label ?? t)} teaserLines={4}>
          <span />
        </PremiumGate>
      ) : null}
    </div>
  );
}
