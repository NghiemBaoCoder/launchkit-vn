import { formatDateTime, formatVND } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { PAYMENT_PROVIDER_LABELS } from "@/lib/payments/labels";
import type { OrderDetail } from "@/lib/payments/orders";
import { OrderStatusBadge, PaymentStatusBadge } from "./status-badges";

/** Khối tóm tắt đơn hàng dùng chung cho các trang kết quả. */
export function OrderSummary({ order, showPayment = true }: { order: OrderDetail; showPayment?: boolean }) {
  const payment = order.payments[0] ?? null;
  return (
    <div className="space-y-3 text-sm">
      <Row label="Mã đơn hàng"><span className="font-mono font-semibold">{order.order_number}</span></Row>
      <Row label="Sản phẩm"><span className="font-medium">{order.products?.name ?? "—"}</span></Row>
      {order.businesses ? <Row label="Business">{order.businesses.name}</Row> : null}
      <Row label="Trạng thái"><OrderStatusBadge status={order.status} /></Row>
      <Row label="Ngày tạo">{formatDateTime(order.created_at)}</Row>
      {order.paid_at ? <Row label="Thanh toán lúc">{formatDateTime(order.paid_at)}</Row> : null}
      <Separator />
      <Row label="Tạm tính">{formatVND(order.subtotal)}</Row>
      {order.discount > 0 ? (
        <Row label={`Giảm giá${order.coupon_code ? ` (${order.coupon_code})` : ""}`}><span className="text-success">−{formatVND(order.discount)}</span></Row>
      ) : null}
      <Row label={<span className="font-semibold text-foreground">Tổng cộng</span>}><span className="text-lg font-bold">{formatVND(order.total)}</span></Row>
      {showPayment && payment ? (
        <>
          <Separator />
          <Row label="Phương thức">{PAYMENT_PROVIDER_LABELS[payment.provider] ?? payment.provider}</Row>
          <Row label="Giao dịch"><PaymentStatusBadge status={payment.status} /></Row>
          {payment.provider_ref ? <Row label="Mã tham chiếu"><span className="font-mono text-xs">{payment.provider_ref}</span></Row> : null}
          {payment.error && payment.status === "failed" ? <Row label="Lý do"><span className="text-destructive">{payment.error}</span></Row> : null}
        </>
      ) : null}
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
