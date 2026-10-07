/** Trừu tượng hoá cổng thanh toán — mỗi provider cài đặt tạo giao dịch và xác thực webhook. */

export interface CreatePaymentInput {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  /** URL quay lại sau khi thanh toán (provider thật dùng để redirect). */
  returnUrl: string;
  /** Mã tham chiếu giao dịch tại merchant (VNPay: vnp_TxnRef, chỉ chữ + số). */
  txnRef?: string;
  /** Mô tả đơn (ASCII, không dấu) hiển thị tại cổng. */
  orderInfo?: string;
  /** IP người mua (VNPay bắt buộc). */
  ipAddr?: string;
  /** Hạn thanh toán tại cổng. */
  expiresAt?: Date;
}

export interface CreatePaymentResult {
  /** Trang người dùng được chuyển tới để thanh toán. */
  redirectUrl: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

export type PaymentProviderName = "mock" | "vnpay";

export const PAYMENT_PROVIDER_NAMES: readonly PaymentProviderName[] = ["mock", "vnpay"] as const;
