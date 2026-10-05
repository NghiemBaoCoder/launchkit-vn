import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "./index";
import { markOrderFailed, markOrderPaid } from "./fulfill";

const payloadSchema = z.object({
  event: z.enum(["payment.succeeded", "payment.failed"]),
  payment_id: z.string().uuid(),
  order_id: z.string().uuid(),
  amount: z.number().nonnegative(),
  provider_ref: z.string().min(1).max(120),
  timestamp: z.string().min(1),
  error: z.string().max(500).optional(),
});

export type MockWebhookPayload = z.infer<typeof payloadSchema>;

export interface WebhookResult {
  status: number;
  body: { ok: boolean; error?: string; alreadyProcessed?: boolean };
}

/**
 * Xử lý webhook của cổng thanh toán mock. Dùng chung cho route HTTP và cho
 * thao tác giả lập trong app (gọi trực tiếp, không phụ thuộc self-fetch qua mạng).
 * Luôn xác thực chữ ký HMAC; idempotent với đơn đã thanh toán.
 */
export async function processMockWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
  const provider = getPaymentProvider("mock");
  if (!provider.verifyWebhookSignature(rawBody, signature)) return { status: 401, body: { ok: false, error: "invalid signature" } };

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { ok: false, error: "invalid json" } };
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "invalid payload" } };
  const payload = parsed.data;

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("id, order_id, amount, provider").eq("id", payload.payment_id).maybeSingle();
  if (!payment) return { status: 404, body: { ok: false, error: "payment not found" } };
  if (payment.order_id !== payload.order_id) return { status: 400, body: { ok: false, error: "order mismatch" } };
  if (Number(payment.amount) !== Number(payload.amount)) return { status: 400, body: { ok: false, error: "amount mismatch" } };

  const event = { provider: "mock", providerRef: payload.provider_ref, rawEvent: payload as Record<string, unknown> };
  const result = payload.event === "payment.succeeded" ? await markOrderPaid(payload.order_id, event) : await markOrderFailed(payload.order_id, { ...event, error: payload.error ?? "Thanh toán thất bại (mock)" });
  if (!result.ok) return { status: 422, body: { ok: false, error: result.error } };
  return { status: 200, body: { ok: true, alreadyProcessed: result.alreadyPaid } };
}
