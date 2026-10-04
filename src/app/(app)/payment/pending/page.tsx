import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Clock, CreditCard, Receipt } from "lucide-react";
import { CancelOrderButton } from "@/components/commerce/cancel-order-button";
import { OrderStatusPoller } from "@/components/commerce/order-status-poller";
import { OrderSummary } from "@/components/commerce/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/payments/fulfill";
import { getOrderDetail, pendingPaymentOf } from "@/lib/payments/orders";

export const metadata: Metadata = { title: "Đang chờ thanh toán" };

export default async function PaymentPendingPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  await requireProfile(`/payment/pending${orderId ? `?order=${orderId}` : ""}`);
  await expireStaleOrders();
  const order = orderId ? await getOrderDetail(orderId) : null;
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Receipt} title="Không tìm thấy đơn hàng" description="Đường dẫn không hợp lệ hoặc đơn hàng không thuộc tài khoản của bạn." action={<Button asChild><Link href="/dashboard/purchases">Xem đơn hàng của tôi</Link></Button>} />
      </div>
    );
  }
  if (order.status === "paid") redirect(`/payment/success?order=${order.id}`);
  if (order.status === "failed") redirect(`/payment/failed?order=${order.id}`);
  if (order.status === "expired" || order.status === "refunded") redirect(`/payment/failed?order=${order.id}&reason=${order.status}`);

  const pendingPayment = pendingPaymentOf(order);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-warning/20 text-warning-foreground"><Clock className="size-8" /></div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Đang chờ thanh toán</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">Trang này tự động cập nhật khi cổng thanh toán xác nhận. Bạn không cần tải lại.</p>
        <div className="mt-4"><OrderStatusPoller orderId={order.id} /></div>
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
        {pendingPayment ? (
          <Button asChild variant="premium" size="lg"><Link href={`/checkout/pay/${pendingPayment.id}`}><CreditCard /> Thanh toán mock</Link></Button>
        ) : null}
        <Button asChild variant="outline" size="lg"><Link href="/dashboard/purchases"><Receipt /> Đơn hàng của tôi</Link></Button>
        <CancelOrderButton orderId={order.id} orderNumber={order.order_number} redirectTo={`/payment/failed?order=${order.id}&reason=expired`} />
      </div>
    </div>
  );
}
