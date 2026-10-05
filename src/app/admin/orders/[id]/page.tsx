import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DetailList } from "@/components/admin/detail-list";
import { JsonView } from "@/components/admin/json-view";
import { OrderActions } from "@/components/admin/orders/order-actions";
import { getOrderDetail } from "@/lib/data/admin-commerce";
import { ENTITLEMENT_LABELS, type EntitlementKey } from "@/lib/access/policy";
import { formatDateTime, formatVND } from "@/lib/utils";

export const metadata = { title: "Chi tiết đơn hàng" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getOrderDetail(id);
  if (!detail) notFound();
  const { order, items, payments, entitlements, commission, redemption, subscription } = detail;
  const meta = (order.metadata ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/admin/orders" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft className="size-3" /> Đơn hàng</Link>}
        title={<span className="font-mono">{order.order_number}</span>}
        description={<span className="inline-flex flex-wrap items-center gap-2"><StatusBadge kind="order" value={order.status} /><span>Tạo {formatDateTime(order.created_at)}</span></span>}
        actions={<OrderActions orderId={order.id} orderNumber={order.order_number} status={order.status} entitlementCount={entitlements.length} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Khách hàng & thanh toán</CardTitle></CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Khách hàng", value: order.profiles ? <Link href={`/admin/users/${order.profiles.id}`} className="hover:underline">{order.profiles.full_name || order.profiles.email}</Link> : "—" },
                { label: "Email", value: <span className="break-all">{order.profiles?.email ?? "—"}</span> },
                { label: "Business", value: order.businesses ? <Link href={`/admin/businesses/${order.businesses.id}`} className="hover:underline">{order.businesses.name}</Link> : <span className="text-muted-foreground">Cấp tài khoản</span> },
                { label: "Phương thức", value: order.payment_method },
                { label: "Tiền tệ", value: order.currency },
                { label: "Mã giảm giá", value: order.coupon_code ? <span className="inline-flex items-center gap-1"><code className="font-mono text-xs">{order.coupon_code}</code>{order.coupons ? <Badge variant="outline">{order.coupons.type === "percentage" ? `${order.coupons.value}%` : formatVND(order.coupons.value)}</Badge> : null}</span> : "—" },
                { label: "Affiliate", value: commission ? <span className="inline-flex items-center gap-1"><code className="font-mono text-xs">{commission.affiliates?.code}</code><StatusBadge kind="commission" value={commission.status} />{formatVND(commission.amount)}</span> : "—" },
                { label: "Đồng ý điều khoản", value: order.terms_accepted_at ? formatDateTime(order.terms_accepted_at) : "—" },
                { label: "Hết hạn", value: formatDateTime(order.expires_at) },
                { label: "Thanh toán lúc", value: order.paid_at ? formatDateTime(order.paid_at) : "—" },
                { label: "Hoàn tiền lúc", value: order.refunded_at ? formatDateTime(order.refunded_at) : "—" },
                { label: "ID", value: <code className="font-mono text-[11px] text-muted-foreground">{order.id}</code> },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
            <CardDescription>{order.products?.name ?? "—"}{subscription ? <> · Gói định kỳ <StatusBadge kind="subscription" value={subscription.status} className="ml-1" /> đến {formatDateTime(subscription.current_period_end)}</> : null}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Mục</TableHead><TableHead className="text-right">Đơn giá</TableHead><TableHead className="text-right">SL</TableHead><TableHead className="text-right">Thành tiền</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Không có dòng sản phẩm</TableCell></TableRow>
                ) : items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatVND(it.unit_price)}</TableCell>
                    <TableCell className="text-right tabular-nums">{it.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatVND(it.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow><TableCell colSpan={3} className="text-right text-muted-foreground">Tạm tính</TableCell><TableCell className="text-right tabular-nums">{formatVND(order.subtotal)}</TableCell></TableRow>
                <TableRow><TableCell colSpan={3} className="text-right text-muted-foreground">Giảm giá{order.coupon_code ? ` (${order.coupon_code})` : ""}</TableCell><TableCell className="text-right tabular-nums">-{formatVND(order.discount)}</TableCell></TableRow>
                <TableRow><TableCell colSpan={3} className="text-right font-semibold">Tổng</TableCell><TableCell className="text-right text-base font-bold tabular-nums">{formatVND(order.total)}</TableCell></TableRow>
              </TableFooter>
            </Table>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Quyền đã cấp bởi đơn này</h3>
              {entitlements.length === 0 ? (
                <p className="text-sm text-muted-foreground">{order.status === "paid" ? "Không có entitlement gắn với đơn." : order.status === "refunded" ? "Đã thu hồi khi hoàn tiền." : "Quyền được cấp sau khi thanh toán thành công."}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {entitlements.map((e) => <Badge key={e.id} variant="success" title={formatDateTime(e.created_at)}>{ENTITLEMENT_LABELS[e.key as EntitlementKey] ?? e.key}</Badge>)}
                </div>
              )}
              {redemption ? <p className="mt-2 text-xs text-muted-foreground">Đã ghi nhận sử dụng mã giảm giá lúc {formatDateTime(redemption.created_at)}.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giao dịch thanh toán</CardTitle>
          <CardDescription>{payments.length} giao dịch từ cổng thanh toán.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState compact icon={Receipt} title="Chưa có giao dịch" />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Cổng</TableHead><TableHead>Mã tham chiếu</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Số tiền</TableHead><TableHead>Lỗi</TableHead><TableHead>Thời gian</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><Link href={`/admin/payments/${p.id}`} className="font-medium hover:underline">{p.provider}</Link></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.provider_ref ?? "—"}</TableCell>
                    <TableCell><StatusBadge kind="payment" value={p.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{formatVND(p.amount)}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-xs text-destructive">{p.error ?? ""}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(p.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {Object.keys(meta).length ? (
        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent><JsonView value={meta} maxHeight="max-h-64" /></CardContent>
        </Card>
      ) : null}
    </div>
  );
}
