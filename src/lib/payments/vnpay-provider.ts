import "server-only";
import { serverEnv } from "@/lib/env";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "./provider";
import { vnpBuildPaymentUrl, vnpFormatDate, vnpParamsFrom, vnpVerify } from "./vnpay/sign";

export const VNPAY_SANDBOX_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

export function vnpayConfig() {
  const { vnpay } = serverEnv();
  return vnpay;
}

export function isVnpayConfigured(): boolean {
  const c = vnpayConfig();
  return Boolean(c.tmnCode && c.hashSecret);
}

export function isVnpaySandbox(): boolean {
  return /sandbox/i.test(vnpayConfig().paymentUrl);
}

/**
 * Cổng VNPay (Pay v2.1.0): tạo URL chuyển hướng người dùng sang trang thanh toán VNPay;
 * kết quả về qua ReturnUrl (trình duyệt) và IPN (server-to-server), cả hai đều ký HMAC-SHA512.
 */
export class VnpayProvider implements PaymentProvider {
  readonly name = "vnpay";

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const c = vnpayConfig();
    if (!c.tmnCode || !c.hashSecret) throw new Error("VNPay chưa được cấu hình (VNPAY_TMN_CODE / VNPAY_HASH_SECRET).");
    if (!input.txnRef) throw new Error("Thiếu mã tham chiếu giao dịch VNPay.");
    const now = new Date();
    const expire = input.expiresAt ?? new Date(now.getTime() + 15 * 60 * 1000);
    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: c.tmnCode,
      vnp_Amount: Math.round(input.amount) * 100,
      vnp_CurrCode: input.currency || "VND",
      vnp_TxnRef: input.txnRef,
      vnp_OrderInfo: input.orderInfo ?? `Thanh toan don hang ${input.txnRef}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: input.returnUrl,
      vnp_IpAddr: input.ipAddr || "127.0.0.1",
      vnp_CreateDate: vnpFormatDate(now),
      vnp_ExpireDate: vnpFormatDate(expire),
    };
    return { redirectUrl: vnpBuildPaymentUrl(c.paymentUrl, params, c.hashSecret) };
  }

  /** rawBody = query string (ReturnUrl/IPN đều dùng GET). */
  verifyWebhookSignature(rawBody: string, _signature: string): boolean {
    void _signature;
    const params = vnpParamsFrom(new URLSearchParams(rawBody.replace(/^\?/, "")));
    return vnpVerify(params, vnpayConfig().hashSecret);
  }
}
