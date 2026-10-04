import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, LayoutDashboard, Receipt, Sparkles } from "lucide-react";
import { OrderSummary } from "@/components/commerce/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/payments/fulfill";
import { getOrderDetail, successHref } from "@/lib/payments/orders";

export const metadata: Metadata = { title: "Thanh toán thành công" };

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  await requireProfile(`/payment/success${orderId ? `?order=${orderId}` : ""}`);
  await expireStaleOrders();
  const order = orderId ? await getOrderDetail(orderId) : null;
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Receipt} title="Không tìm thấy đơn hàng" description="Đường dẫn không hợp lệ hoặc đơn hàng không thuộc tài khoản của bạn." action={<Button asChild><Link href="/dashboard/purchases">Xem đơn hàng của tôi</Link></Button>} />
      </div>
    );
  }
  if (order.status === "pending") redirect(`/payment/pending?order=${order.id}`);
  if (order.status === "failed" || order.status === "expired") redirect(`/payment/failed?order=${order.id}${order.status === "expired" ? "&reason=expired" : ""}`);

  const product = order.products;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 className="size-8" /></div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thanh toán thành công</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          {product ? `${product.name} đã được mở khoá` : "Gói đã được mở khoá"}{order.businesses ? ` cho "${order.businesses.name}"` : ""}.{product && product.credits > 0 ? ` Bạn được cộng ${product.credits} credits.` : ""}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Receipt className="size-4 text-muted-foreground" /> Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderSummary order={order} />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild variant="premium" size="lg">
          <Link href={successHref(order)}>{order.business_id ? <><Sparkles /> Mở workspace</> : <><Sparkles /> Xem gói của tôi</>} <ArrowRight /></Link>
        </Button>
        <Button asChild variant="outline" size="lg"><Link href="/dashboard/purchases"><Receipt /> Xem đơn hàng</Link></Button>
        <Button asChild variant="ghost" size="lg"><Link href="/dashboard"><LayoutDashboard /> Về dashboard</Link></Button>
      </div>
    </div>
  );
}
