import Link from "next/link";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { getPaymentProviders, listPayments, parsePaymentFilters } from "@/lib/data/admin-commerce";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Thanh toán" };

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parsePaymentFilters(sp);
  const [result, providers] = await Promise.all([listPayments(filters), getPaymentProviders()]);
  const hasFilter = Boolean(filters.q || filters.status || filters.provider);

  return (
    <div className="space-y-6">
      <PageHeader title="Thanh toán" description={`${formatNumber(result.total)} giao dịch${hasFilter ? " khớp bộ lọc" : ""} từ các cổng thanh toán.`} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo mã tham chiếu, mã đơn, email…"
        filters={[
          { name: "status", label: "Trạng thái", options: statusOptions("payment") },
          { name: "provider", label: "Cổng", options: providers.map((p) => ({ value: p, label: p })) },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Receipt} title={hasFilter ? "Không có giao dịch khớp bộ lọc" : "Chưa có giao dịch"} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cổng / tham chiếu</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/payments/${p.id}`} className="font-medium hover:underline">{p.provider}</Link>
                    <div className="font-mono text-xs text-muted-foreground">{p.provider_ref ?? p.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell><Link href={`/admin/orders/${p.order_id}`} className="font-mono text-xs font-semibold hover:underline">{p.orders?.order_number ?? "—"}</Link></TableCell>
                  <TableCell className="max-w-[220px]"><UserLink id={p.user_id} email={p.profiles?.email} name={p.profiles?.full_name} /></TableCell>
                  <TableCell>
                    <StatusBadge kind="payment" value={p.status} />
                    {p.error ? <div className="mt-0.5 max-w-[200px] truncate text-xs text-destructive" title={p.error}>{p.error}</div> : null}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatVND(p.amount)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(p.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/payments", sp)} />
    </div>
  );
}
