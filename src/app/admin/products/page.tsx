import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { ToggleActiveSwitch } from "@/components/admin/toggle-active-switch";
import { CreateProductButton } from "@/components/admin/products/product-form";
import { listProductsAdmin, parseProductFilters } from "@/lib/data/admin-commerce";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Sản phẩm" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const result = await listProductsAdmin(filters);
  const hasFilter = Boolean(filters.q || filters.kind || filters.active);

  return (
    <div className="space-y-6">
      <PageHeader title="Sản phẩm" description={`${formatNumber(result.total)} sản phẩm. Gói bán ra, quyền mở khoá và credits tặng kèm.`} actions={<CreateProductButton />} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo tên hoặc slug…"
        filters={[
          { name: "kind", label: "Loại", options: statusOptions("productKind") },
          { name: "active", label: "Trạng thái", options: [{ value: "active", label: "Đang bán" }, { value: "inactive", label: "Đã ẩn" }] },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Package} title={hasFilter ? "Không có sản phẩm khớp bộ lọc" : "Chưa có sản phẩm"} action={!hasFilter ? <CreateProductButton /> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Bán</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead>Quyền</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => (
                <TableRow key={p.id} className={!p.active ? "opacity-60" : undefined}>
                  <TableCell className="text-center"><ToggleActiveSwitch kind="product" id={p.id} active={p.active} label={`Bật/tắt ${p.name}`} /></TableCell>
                  <TableCell>
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                    {p.recommended ? <Badge variant="premium" className="ml-2">Đề xuất</Badge> : null}
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="productKind" value={p.kind} />
                    {p.kind === "subscription" && p.billing_interval ? <span className="ml-1 text-xs text-muted-foreground">/{p.billing_interval === "year" ? "năm" : "tháng"}</span> : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.sale_price != null && p.sale_price < p.price ? (
                      <><span className="font-medium">{formatVND(p.sale_price)}</span> <span className="text-xs text-muted-foreground line-through">{formatVND(p.price)}</span></>
                    ) : (
                      <span className="font-medium">{p.kind === "free" ? "0 ₫" : formatVND(p.price)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.credits}</TableCell>
                  <TableCell className="text-muted-foreground">{p.entitlements.length} quyền · {p.entitlement_scope === "account" ? "tài khoản" : "business"}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{p.sort_order}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/products", sp)} />
    </div>
  );
}
