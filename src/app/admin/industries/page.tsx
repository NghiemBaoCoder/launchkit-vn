import { Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { ToggleActiveSwitch } from "@/components/admin/toggle-active-switch";
import { CreateIndustryButton, IndustryRowActions } from "@/components/admin/catalog/industry-dialog";
import { getAllBusinessTypes, listIndustriesAdmin, parseIndustryFilters } from "@/lib/data/admin-catalog";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Ngành" };

export default async function AdminIndustriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseIndustryFilters(sp);
  const [result, businessTypes] = await Promise.all([listIndustriesAdmin(filters), getAllBusinessTypes()]);
  const hasFilter = Boolean(filters.q || filters.businessTypeId || filters.active);
  const btOptions = businessTypes.map((b) => ({ id: b.id, name: b.name, active: b.active }));

  return (
    <div className="space-y-6">
      <PageHeader title="Ngành" description={`${formatNumber(result.total)} ngành${hasFilter ? " khớp bộ lọc" : ""}. Ngành có business tham chiếu chỉ có thể tắt, không xoá.`} actions={<CreateIndustryButton businessTypes={btOptions} />} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo tên hoặc slug…"
        filters={[
          { name: "type", label: "Loại hình", options: businessTypes.map((b) => ({ value: b.id, label: b.name })) },
          { name: "active", label: "Trạng thái", options: [{ value: "active", label: "Đang bật" }, { value: "inactive", label: "Đã tắt" }] },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Layers} title={hasFilter ? "Không có ngành khớp bộ lọc" : "Chưa có ngành"} description="Thêm ngành để khách chọn trong wizard." action={!hasFilter ? <CreateIndustryButton businessTypes={btOptions} /> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Bật</TableHead>
                <TableHead>Ngành</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Business</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((i) => {
                const { business_types: bt, businesses: bizAgg, ...industry } = i;
                const bizCount = bizAgg?.[0]?.count ?? 0;
                return (
                  <TableRow key={i.id} className={!i.active ? "opacity-60" : undefined}>
                    <TableCell className="text-center"><ToggleActiveSwitch kind="industry" id={i.id} active={i.active} label={`Bật/tắt ${i.name}`} /></TableCell>
                    <TableCell>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">/{i.slug}{i.description ? ` · ${i.description}` : ""}</div>
                    </TableCell>
                    <TableCell>{bt ? <Badge variant="outline">{bt.name}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><code className="text-xs text-muted-foreground">{i.icon ?? "—"}</code></TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(bizCount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{i.sort_order}</TableCell>
                    <TableCell><IndustryRowActions industry={industry} businessTypes={btOptions} businessCount={bizCount} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/industries", sp)} />
    </div>
  );
}
