import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_VARIANTS, SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_VARIANTS, type SubscriptionStatus } from "@/lib/payments/labels";
import type { OrderStatus, PaymentStatus } from "@/types";

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return <Badge variant={ORDER_STATUS_VARIANTS[status] ?? "secondary"} className={className}>{ORDER_STATUS_LABELS[status] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return <Badge variant={PAYMENT_STATUS_VARIANTS[status] ?? "secondary"} className={className}>{PAYMENT_STATUS_LABELS[status] ?? status}</Badge>;
}

export function SubscriptionStatusBadge({ status, cancelAtPeriodEnd, className }: { status: SubscriptionStatus; cancelAtPeriodEnd?: boolean; className?: string }) {
  if (status === "active" && cancelAtPeriodEnd) return <Badge variant="warning" className={className}>Đã huỷ gia hạn</Badge>;
  return <Badge variant={SUBSCRIPTION_STATUS_VARIANTS[status] ?? "secondary"} className={className}>{SUBSCRIPTION_STATUS_LABELS[status] ?? status}</Badge>;
}
