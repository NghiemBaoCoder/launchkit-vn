import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { listOrders, parseOrderFilters } from "@/lib/data/admin-commerce";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Đơn hàng" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseOrderFilters(sp);
  const result = await listOrders(filters);
  const hasFilter = Boolean(filters.q || filters.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Đơn hàng" description={`${formatNumber(result.total)} đơn${hasFilter ? " khớp bộ lọc" : ""}.`} />
      <DataTableToolbar searchPlaceholder="Tìm theo mã đơn, email, tên khách, mã giảm giá…" filters={[{ name: "status", label: "Trạng thái", options: statusOptions("order") }]} />
      {result.items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={hasFilter ? "Không có đơn khớp bộ lọc" : "Chưa có đơn hàng"} description={hasFilter ? "Thử từ khoá khác hoặc xoá bộ lọc." : "Đơn hàng xuất hiện khi khách bắt đầu checkout."} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Tạo lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link></TableCell>
                  <TableCell className="max-w-[240px]"><UserLink id={o.user_id} email={o.profiles?.email} name={o.profiles?.full_name} /></TableCell>
                  <TableCell>{o.products?.name ?? "—"}</TableCell>
                  <TableCell><StatusBadge kind="order" value={o.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div className="font-medium">{formatVND(o.total)}</div>
                    {o.discount > 0 ? <div className="text-xs text-muted-foreground">-{formatVND(o.discount)}{o.coupon_code ? ` (${o.coupon_code})` : ""}</div> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.payment_method}{o.paid_at ? <div className="text-xs">{formatDateTime(o.paid_at)}</div> : null}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/orders", sp)} />
    </div>
  );
}
