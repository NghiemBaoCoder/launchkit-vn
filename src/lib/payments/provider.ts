/** Trừu tượng hoá cổng thanh toán — mỗi provider cài đặt tạo giao dịch và xác thực webhook. */

export interface CreatePaymentInput {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  /** URL quay lại sau khi thanh toán (provider thật dùng để redirect). */
  returnUrl: string;
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

export type PaymentProviderName = "mock";
