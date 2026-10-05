import "server-only";
import { MockPaymentProvider } from "./mock-provider";
import type { PaymentProvider, PaymentProviderName } from "./provider";

export type { PaymentProvider, PaymentProviderName, CreatePaymentInput, CreatePaymentResult } from "./provider";
export { MockPaymentProvider, MOCK_SIGNATURE_HEADER } from "./mock-provider";
export * from "./labels";
export * from "./pricing";

const providers: Partial<Record<PaymentProviderName, PaymentProvider>> = {};

/** Lấy provider theo tên (mặc định mock). Provider thật (VNPay/MoMo) sẽ được thêm sau. */
export function getPaymentProvider(name: PaymentProviderName | string = "mock"): PaymentProvider {
  const key = (name || "mock") as PaymentProviderName;
  if (key !== "mock") throw new Error(`Cổng thanh toán "${name}" chưa được tích hợp.`);
  if (!providers[key]) providers[key] = new MockPaymentProvider();
  return providers[key]!;
}
