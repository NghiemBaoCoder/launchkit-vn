/** Nhãn tiếng Việt cho trạng thái đơn hàng / thanh toán / gói — an toàn cho client. */
import type { OrderStatus, PaymentStatus, Enums } from "@/types";

export type SubscriptionStatus = Enums<"subscription_status">;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  expired: "Hết hạn",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  succeeded: "Thành công",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Đang hoạt động",
  canceled: "Đã huỷ",
  expired: "Hết hạn",
  past_due: "Quá hạn thanh toán",
};

export type StatusBadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline";

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, StatusBadgeVariant> = {
  pending: "warning",
  paid: "success",
  failed: "destructive",
  expired: "secondary",
  refunded: "info",
};

export const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, StatusBadgeVariant> = {
  pending: "warning",
  processing: "info",
  succeeded: "success",
  failed: "destructive",
  refunded: "info",
};

export const SUBSCRIPTION_STATUS_VARIANTS: Record<SubscriptionStatus, StatusBadgeVariant> = {
  active: "success",
  canceled: "secondary",
  expired: "secondary",
  past_due: "destructive",
};

export const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  mock: "Mock Payment (demo)",
  vnpay: "VNPay",
  momo: "MoMo",
  card: "Thẻ quốc tế",
};

/** Các phương thức hiển thị ở trang checkout — chỉ mock đang hoạt động. */
export const PAYMENT_METHODS: { id: string; label: string; description: string; enabled: boolean }[] = [
  { id: "mock", label: "Mock Payment (demo)", description: "Cổng thanh toán giả lập để kiểm thử — không trừ tiền thật.", enabled: true },
  { id: "vnpay", label: "VNPay", description: "Cần tích hợp", enabled: false },
  { id: "momo", label: "MoMo", description: "Cần tích hợp", enabled: false },
  { id: "card", label: "Thẻ quốc tế", description: "Cần tích hợp", enabled: false },
];
