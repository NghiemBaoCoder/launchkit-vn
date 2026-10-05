import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { ToggleActiveSwitch } from "@/components/admin/toggle-active-switch";
import { BusinessTypeRowActions, CreateBusinessTypeButton } from "@/components/admin/catalog/business-type-dialog";
import { listBusinessTypesAdmin, parseBusinessTypeFilters } from "@/lib/data/admin-catalog";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Loại hình" };

export default async function AdminBusinessTypesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseBusinessTypeFilters(sp);
  const result = await listBusinessTypesAdmin(filters);
  const hasFilter = Boolean(filters.q || filters.active);

  return (
    <div className="space-y-6">
      <PageHeader title="Loại hình kinh doanh" description={`${formatNumber(result.total)} loại hình${hasFilter ? " khớp bộ lọc" : ""}. Mỗi loại hình có landing page /for/[slug].`} actions={<CreateBusinessTypeButton />} />
      <DataTableToolbar searchPlaceholder="Tìm theo tên hoặc slug…" filters={[{ name: "active", label: "Trạng thái", options: [{ value: "active", label: "Đang bật" }, { value: "inactive", label: "Đã tắt" }] }]} />
      {result.items.length === 0 ? (
        <EmptyState icon={Briefcase} title={hasFilter ? "Không có loại hình khớp bộ lọc" : "Chưa có loại hình"} action={!hasFilter ? <CreateBusinessTypeButton /> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Bật</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Tagline</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Ngành</TableHead>
                <TableHead className="text-right">Business</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((row) => {
                const { businesses: bizAgg, industries: indAgg, ...bt } = row;
                const bizCount = bizAgg?.[0]?.count ?? 0;
                const indCount = indAgg?.[0]?.count ?? 0;
                return (
                  <TableRow key={bt.id} className={!bt.active ? "opacity-60" : undefined}>
                    <TableCell className="text-center"><ToggleActiveSwitch kind="business_type" id={bt.id} active={bt.active} label={`Bật/tắt ${bt.name}`} /></TableCell>
                    <TableCell>
                      <div className="font-medium">{bt.name}</div>
                      <div className="text-xs text-muted-foreground">/for/{bt.slug}</div>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground">{bt.tagline ?? "—"}</TableCell>
                    <TableCell><code className="text-xs text-muted-foreground">{bt.icon ?? "—"}</code></TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(indCount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(bizCount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{bt.sort_order}</TableCell>
                    <TableCell><BusinessTypeRowActions businessType={bt} businessCount={bizCount} industryCount={indCount} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/business-types", sp)} />
    </div>
  );
}
