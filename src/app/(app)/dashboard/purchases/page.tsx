import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CreditCard, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { OrderStatusBadge } from "@/components/commerce/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { expireStaleOrders } from "@/lib/payments/fulfill";
import { formatDateTime, formatVND } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "Đơn hàng" };

const PAGE_SIZE = 10;

type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  paid_at: string | null;
  business_id: string | null;
  metadata: unknown;
  products: { name: string; slug: string; entitlement_scope: string } | null;
  businesses: { name: string } | null;
  payments: { id: string; status: PaymentStatus; created_at: string }[];
};

function actionFor(o: OrderRow): { href: string; label: string; icon: React.ReactNode; variant: "default" | "outline" | "ghost" | "premium" } {
  if (o.status === "paid") {
    if (o.business_id) return { href: `/business/${o.business_id}/overview`, label: "Mở workspace", icon: <Sparkles />, variant: "default" };
    return { href: "/dashboard/billing", label: "Xem gói", icon: <ArrowRight />, variant: "outline" };
  }
  if (o.status === "pending") {
    const p = [...o.payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).find((x) => x.status === "pending" || x.status === "processing");
    return { href: p ? `/checkout/pay/${p.id}` : `/payment/pending?order=${o.id}`, label: "Tiếp tục thanh toán", icon: <CreditCard />, variant: "premium" };
  }
  return { href: o.status === "refunded" ? `/payment/success?order=${o.id}` : `/payment/failed?order=${o.id}${o.status === "expired" ? "&reason=expired" : ""}`, label: "Xem", icon: <Eye />, variant: "ghost" };
}

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const profile = await requireProfile("/dashboard/purchases");
  await expireStaleOrders();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, paid_at, business_id, metadata, products(name, slug, entitlement_scope), businesses(name), payments(id, status, created_at)", { count: "exact" })
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  // PostgREST trả 416 (PGRST103) khi offset vượt quá số dòng -> coi như trang trống
  const rangeError = error?.code === "PGRST103";
  const loadError = error && !rangeError ? error : null;
  const orders = (rangeError ? [] : (data ?? [])) as unknown as OrderRow[];
  const total = count ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Đơn hàng" description="Lịch sử mua gói và trạng thái thanh toán của bạn." actions={<Button asChild variant="outline"><Link href="/dashboard/billing"><CreditCard /> Gói & thanh toán</Link></Button>} />

      {loadError ? (
        <EmptyState icon={ShoppingBag} title="Không tải được đơn hàng" description={loadError.message} action={<Button asChild variant="outline"><Link href="/dashboard/purchases">Thử lại</Link></Button>} />
      ) : orders.length === 0 && page === 1 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Bạn chưa có đơn hàng nào"
          description="Mở khoá Business Kit đầy đủ để nhận toàn bộ nội dung, tài liệu và xuất file."
          action={
            <>
              <Button asChild variant="premium"><Link href="/pricing"><Sparkles /> Xem bảng giá</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/businesses">Business của tôi</Link></Button>
            </>
          }
        />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Đơn hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="hidden md:table-cell">Business</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày</TableHead>
                    <TableHead className="pr-5 text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    const a = actionFor(o);
                    const productName = o.products?.name ?? (o.metadata as { product_slug?: string } | null)?.product_slug ?? "—";
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="pl-5">
                          <div className="font-mono text-xs font-semibold">{o.order_number}</div>
                          <div className="text-xs text-muted-foreground lg:hidden">{formatDateTime(o.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{productName}</div>
                          {o.businesses ? <div className="text-xs text-muted-foreground md:hidden">{o.businesses.name}</div> : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{o.businesses?.name ?? <span className="text-muted-foreground">Tài khoản</span>}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatVND(o.total)}</TableCell>
                        <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          <div>{formatDateTime(o.created_at)}</div>
                          {o.paid_at ? <div className="text-xs">TT: {formatDateTime(o.paid_at)}</div> : null}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Button asChild size="sm" variant={a.variant}><Link href={a.href}>{a.icon} {a.label}</Link></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {orders.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Không có đơn hàng ở trang này. <Link href="/dashboard/purchases" className="text-primary hover:underline">Về trang đầu</Link></TableCell></TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} baseHref="/dashboard/purchases" />
    </div>
  );
}
