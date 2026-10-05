import { Gift } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { AffiliateActions } from "@/components/admin/affiliates/affiliate-actions";
import { listAffiliates, parseAffiliateFilters } from "@/lib/data/admin-affiliates";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Affiliate" };

export default async function AdminAffiliatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseAffiliateFilters(sp);
  const result = await listAffiliates(filters);
  const hasFilter = Boolean(filters.q || filters.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate" description={`${formatNumber(result.total)} affiliate${hasFilter ? " khớp bộ lọc" : ""}. Mỗi tài khoản có một mã giới thiệu; hoa hồng được tính khi đơn giới thiệu thanh toán thành công.`} />
      <Alert variant="info">
        <AlertDescription>Thanh toán hoa hồng (payout) thực hiện thủ công bằng chuyển khoản. Sau khi chuyển, mở &quot;Hoa hồng&quot; và đánh dấu từng khoản là đã trả.</AlertDescription>
      </Alert>
      <DataTableToolbar searchPlaceholder="Tìm theo mã, email, tên…" filters={[{ name: "status", label: "Trạng thái", options: statusOptions("affiliate") }]} />
      {result.items.length === 0 ? (
        <EmptyState icon={Gift} title={hasFilter ? "Không có affiliate khớp bộ lọc" : "Chưa có affiliate"} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Click</TableHead>
                <TableHead className="text-right">Đăng ký</TableHead>
                <TableHead className="text-right">Đơn</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Hoa hồng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <code className="font-mono text-sm font-semibold">{a.code}</code>
                    <div className="text-xs text-muted-foreground">{a.commission_rate}%</div>
                  </TableCell>
                  <TableCell className="max-w-[220px]"><UserLink id={a.user?.id} email={a.user?.email} name={a.user?.full_name} /></TableCell>
                  <TableCell><StatusBadge kind="affiliate" value={a.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(a.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(a.signups)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(a.orders)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatVND(a.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div className="font-medium">{formatVND(a.commissionTotal)}</div>
                    {a.commissionPending > 0 ? <div className="text-xs text-warning-foreground">chưa trả {formatVND(a.commissionPending)}</div> : a.commissionPaid > 0 ? <div className="text-xs text-muted-foreground">đã trả đủ</div> : null}
                  </TableCell>
                  <TableCell><AffiliateActions affiliate={a} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/affiliates", sp)} />
    </div>
  );
}
