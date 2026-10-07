import "server-only";
import { MockPaymentProvider } from "./mock-provider";
import { VnpayProvider } from "./vnpay-provider";
import type { PaymentProvider, PaymentProviderName } from "./provider";

export type { PaymentProvider, PaymentProviderName, CreatePaymentInput, CreatePaymentResult } from "./provider";
export { MockPaymentProvider, MOCK_SIGNATURE_HEADER } from "./mock-provider";
export { VnpayProvider, isVnpayConfigured, isVnpaySandbox } from "./vnpay-provider";
export * from "./labels";
export * from "./pricing";

const providers: Partial<Record<PaymentProviderName, PaymentProvider>> = {};

/** Lấy provider theo tên (mặc định mock). Hỗ trợ: mock, vnpay. */
export function getPaymentProvider(name: PaymentProviderName | string = "mock"): PaymentProvider {
  const key = (name || "mock") as PaymentProviderName;
  if (key !== "mock" && key !== "vnpay") throw new Error(`Cổng thanh toán "${name}" chưa được tích hợp.`);
  if (!providers[key]) providers[key] = key === "vnpay" ? new VnpayProvider() : new MockPaymentProvider();
  return providers[key]!;
}
