import { Tags } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { ToggleActiveSwitch } from "@/components/admin/toggle-active-switch";
import { CreateCouponButton, EditCouponButton } from "@/components/admin/coupons/coupon-dialog";
import { getAllProducts, listCoupons, parseCouponFilters } from "@/lib/data/admin-commerce";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Mã giảm giá" };

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseCouponFilters(sp);
  const [result, products] = await Promise.all([listCoupons(filters), getAllProducts()]);
  const hasFilter = Boolean(filters.q || filters.active || filters.type);
  const productOptions = products.map((p) => ({ id: p.id, name: p.name, active: p.active }));
  const productName = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <PageHeader title="Mã giảm giá" description={`${formatNumber(result.total)} mã${hasFilter ? " khớp bộ lọc" : ""}. Vô hiệu hoá thay vì xoá để giữ lịch sử sử dụng.`} actions={<CreateCouponButton products={productOptions} />} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo mã hoặc mô tả…"
        filters={[
          { name: "type", label: "Kiểu", options: statusOptions("couponType") },
          { name: "active", label: "Trạng thái", options: [{ value: "active", label: "Đang bật" }, { value: "inactive", label: "Vô hiệu" }] },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Tags} title={hasFilter ? "Không có mã khớp bộ lọc" : "Chưa có mã giảm giá"} action={!hasFilter ? <CreateCouponButton products={productOptions} /> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Bật</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Giảm</TableHead>
                <TableHead>Điều kiện</TableHead>
                <TableHead className="text-right">Đã dùng</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead className="text-right">Sửa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((row) => {
                const { state, ...c } = row;
                return (
                  <TableRow key={c.id} className={!c.active ? "opacity-60" : undefined}>
                    <TableCell className="text-center"><ToggleActiveSwitch kind="coupon" id={c.id} active={c.active} label={`Bật/tắt ${c.code}`} /></TableCell>
                    <TableCell>
                      <div className="font-mono text-sm font-semibold">{c.code}</div>
                      {c.description ? <div className="max-w-[260px] truncate text-xs text-muted-foreground">{c.description}</div> : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge kind="couponType" value={c.type} />
                        <span className="font-medium tabular-nums">{c.type === "percentage" ? `${c.value}%` : formatVND(c.value)}</span>
                      </div>
                      {c.type === "percentage" && c.max_discount != null ? <div className="text-xs text-muted-foreground">tối đa {formatVND(c.max_discount)}</div> : null}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{c.min_order > 0 ? `Đơn từ ${formatVND(c.min_order)}` : "Không yêu cầu đơn tối thiểu"}</div>
                      <div>{c.per_user_limit} lần/người{c.applicable_product_ids.length ? ` · ${c.applicable_product_ids.map((id) => productName.get(id) ?? "?").join(", ")}` : " · mọi sản phẩm"}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ""}{state === "exhausted" ? <Badge variant="warning" className="ml-1">Hết lượt</Badge> : null}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {state === "expired" ? <Badge variant="secondary">Đã hết hạn</Badge> : state === "not_started" ? <Badge variant="info">Chưa bắt đầu</Badge> : <Badge variant="success">Hiệu lực</Badge>}
                      <div className="mt-0.5">{c.starts_at ? formatDateTime(c.starts_at) : "—"} → {c.expires_at ? formatDateTime(c.expires_at) : "vô hạn"}</div>
                    </TableCell>
                    <TableCell className="text-right"><EditCouponButton coupon={c} products={productOptions} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/coupons", sp)} />
    </div>
  );
}
