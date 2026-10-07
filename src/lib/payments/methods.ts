import "server-only";
import { isVnpayConfigured, isVnpaySandbox } from "./vnpay-provider";
import type { PaymentMethodOption } from "./labels";

/** Danh sách phương thức cho trang checkout, tính ở server theo cấu hình env. */
export function getPaymentMethods(): PaymentMethodOption[] {
  const vnpay = isVnpayConfigured();
  return [
    {
      id: "vnpay",
      label: "VNPay",
      description: vnpay ? (isVnpaySandbox() ? "Thẻ ATM nội địa, QR, thẻ quốc tế — môi trường thử nghiệm (sandbox), không trừ tiền thật." : "Thẻ ATM nội địa, QR, Visa/Master qua cổng VNPay.") : "Chưa cấu hình (cần VNPAY_TMN_CODE và VNPAY_HASH_SECRET).",
      enabled: vnpay,
      badge: vnpay ? (isVnpaySandbox() ? "Sandbox" : "Thật") : "Chưa cấu hình",
    },
    { id: "mock", label: "Mock Payment (demo)", description: "Cổng thanh toán giả lập để kiểm thử — không trừ tiền thật.", enabled: true, badge: "Demo" },
    { id: "momo", label: "MoMo", description: "Cần tích hợp", enabled: false, badge: "Cần tích hợp" },
    { id: "card", label: "Thẻ quốc tế", description: "Thanh toán qua VNPay (chọn VNPay ở trên).", enabled: false, badge: "Qua VNPay" },
  ];
}
