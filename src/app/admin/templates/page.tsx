import { FileCode2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { ToggleActiveSwitch } from "@/components/admin/toggle-active-switch";
import { CreateTemplateButton, TEMPLATE_CATEGORY_LABELS, TemplateRowActions } from "@/components/admin/catalog/template-dialog";
import { getAllBusinessTypes, getAllIndustries, listTemplatesAdmin, parseTemplateFilters, TEMPLATE_CATEGORIES } from "@/lib/data/admin-catalog";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const metadata = { title: "Template" };

export default async function AdminTemplatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseTemplateFilters(sp);
  const [result, businessTypes, industries] = await Promise.all([listTemplatesAdmin(filters), getAllBusinessTypes(), getAllIndustries()]);
  const hasFilter = Boolean(filters.q || filters.category || filters.active);
  const btOptions = businessTypes.map((b) => ({ id: b.id, name: b.name, active: b.active }));
  const indOptions = industries.map((i) => ({ id: i.id, name: i.name, active: i.active }));

  return (
    <div className="space-y-6">
      <PageHeader title="Template" description={`${formatNumber(result.total)} template${hasFilter ? " khớp bộ lọc" : ""}. Config JSON điều khiển cách AI sinh từng mục.`} actions={<CreateTemplateButton businessTypes={btOptions} industries={indOptions} />} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo tên…"
        filters={[
          { name: "category", label: "Danh mục", options: TEMPLATE_CATEGORIES.map((c) => ({ value: c, label: TEMPLATE_CATEGORY_LABELS[c] })) },
          { name: "active", label: "Trạng thái", options: [{ value: "active", label: "Đang bật" }, { value: "inactive", label: "Đã tắt" }] },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={FileCode2} title={hasFilter ? "Không có template khớp bộ lọc" : "Chưa có template"} action={!hasFilter ? <CreateTemplateButton businessTypes={btOptions} industries={indOptions} /> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Bật</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Áp dụng</TableHead>
                <TableHead className="text-right">Phiên bản</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((row) => {
                const { business_types: bt, industries: ind, ...t } = row;
                const keys = Object.keys((t.config as Record<string, unknown>) ?? {});
                return (
                  <TableRow key={t.id} className={!t.active ? "opacity-60" : undefined}>
                    <TableCell className="text-center"><ToggleActiveSwitch kind="template" id={t.id} active={t.active} label={`Bật/tắt ${t.name}`} /></TableCell>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{keys.length ? `${keys.length} khoá: ${keys.slice(0, 4).join(", ")}${keys.length > 4 ? "…" : ""}` : "Config trống"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{TEMPLATE_CATEGORY_LABELS[t.category]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">
                      {!bt && !ind ? "Chung" : [bt?.name, ind?.name].filter(Boolean).join(" · ")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">v{t.version}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(t.updated_at)}</TableCell>
                    <TableCell><TemplateRowActions template={t} businessTypes={btOptions} industries={indOptions} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/templates", sp)} />
    </div>
  );
}
