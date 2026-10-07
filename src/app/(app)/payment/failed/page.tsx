import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Clock, LifeBuoy, Receipt, RefreshCw, XCircle } from "lucide-react";
import { OrderSummary } from "@/components/commerce/order-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/payments/fulfill";
import { vnpMessage } from "@/lib/payments/vnpay/sign";
import { getOrderDetail, resumePaymentHref, retryCheckoutHref } from "@/lib/payments/orders";

export const metadata: Metadata = { title: "Thanh toán thất bại" };

export default async function PaymentFailedPage({ searchParams }: { searchParams: Promise<{ order?: string; reason?: string; code?: string }> }) {
  const { order: orderId, reason, code } = await searchParams;
  await requireProfile(`/payment/failed${orderId ? `?order=${orderId}` : ""}`);
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

  const expired = order.status === "expired" || reason === "expired";
  const stillPending = order.status === "pending";
  const payment = order.payments[0] ?? null;
  const title = expired ? "Đơn hàng đã hết hạn" : stillPending ? "Thanh toán chưa hoàn tất" : "Thanh toán thất bại";
  const description = expired
    ? "Đơn hàng chỉ có hiệu lực trong 24 giờ. Bạn có thể tạo đơn mới với cùng sản phẩm — mã giảm giá vẫn áp dụng được."
    : stillPending
      ? "Giao dịch chưa được xác nhận. Bạn có thể tiếp tục thanh toán cho đơn này hoặc tạo đơn mới."
      : "Cổng thanh toán báo giao dịch không thành công. Không có khoản tiền nào bị trừ.";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex size-16 items-center justify-center rounded-full ${expired ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>{expired ? <Clock className="size-8" /> : <XCircle className="size-8" />}</div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {payment?.error && payment.status === "failed" ? (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Lý do{reason === "vnpay" ? " (VNPay)" : ""}</AlertTitle>
          <AlertDescription>{payment.error}{reason === "vnpay" && code ? ` · mã ${code}` : ""}</AlertDescription>
        </Alert>
      ) : reason === "vnpay" ? (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>VNPay báo không thành công</AlertTitle>
          <AlertDescription>{vnpMessage(code)}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Receipt className="size-4 text-muted-foreground" /> Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderSummary order={order} />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {stillPending ? (
          <Button asChild variant="premium" size="lg"><Link href={resumePaymentHref(order)}><RefreshCw /> Tiếp tục thanh toán</Link></Button>
        ) : (
          <Button asChild variant="premium" size="lg"><Link href={retryCheckoutHref(order)}><RefreshCw /> Thử lại</Link></Button>
        )}
        <Button asChild variant="outline" size="lg"><Link href="/contact"><LifeBuoy /> Liên hệ hỗ trợ</Link></Button>
        <Button asChild variant="ghost" size="lg"><Link href="/dashboard/purchases"><Receipt /> Đơn hàng của tôi</Link></Button>
      </div>
    </div>
  );
}
