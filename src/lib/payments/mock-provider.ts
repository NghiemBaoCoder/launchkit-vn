import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "./provider";

export const MOCK_SIGNATURE_HEADER = "x-mock-signature";

/** Ký payload webhook bằng HMAC-SHA256 (hex) với MOCK_PAYMENT_WEBHOOK_SECRET. */
export function signMockPayload(rawBody: string): string {
  return createHmac("sha256", serverEnv().mockPaymentSecret).update(rawBody, "utf8").digest("hex");
}

/**
 * Cổng thanh toán giả lập: chuyển người dùng tới trang /checkout/pay/[paymentId],
 * tại đó họ bấm "thành công" / "thất bại" và server gửi webhook đã ký về chính app.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return { redirectUrl: `/checkout/pay/${input.paymentId}` };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature || typeof signature !== "string") return false;
    const expected = signMockPayload(rawBody);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  sign(rawBody: string): string {
    return signMockPayload(rawBody);
  }
}
