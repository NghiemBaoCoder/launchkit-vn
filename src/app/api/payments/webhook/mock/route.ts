import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider, MOCK_SIGNATURE_HEADER } from "@/lib/payments";
import { markOrderFailed, markOrderPaid } from "@/lib/payments/fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  event: z.enum(["payment.succeeded", "payment.failed"]),
  payment_id: z.string().uuid(),
  order_id: z.string().uuid(),
  amount: z.number().nonnegative(),
  provider_ref: z.string().min(1).max(120),
  timestamp: z.string().min(1),
  error: z.string().max(500).optional(),
});

/**
 * Webhook của cổng thanh toán mock. Không cần cookie đăng nhập — xác thực bằng chữ ký HMAC.
 * Idempotent: gọi lại nhiều lần cho cùng đơn không cấp quyền lần hai.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get(MOCK_SIGNATURE_HEADER) ?? "";
  const provider = getPaymentProvider("mock");
  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  const payload = parsed.data;

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("id, order_id, amount, provider").eq("id", payload.payment_id).maybeSingle();
  if (!payment) return NextResponse.json({ ok: false, error: "payment not found" }, { status: 404 });
  if (payment.order_id !== payload.order_id) return NextResponse.json({ ok: false, error: "order mismatch" }, { status: 400 });
  if (Number(payment.amount) !== Number(payload.amount)) return NextResponse.json({ ok: false, error: "amount mismatch" }, { status: 400 });

  const event = { provider: "mock", providerRef: payload.provider_ref, rawEvent: payload as Record<string, unknown> };
  const result = payload.event === "payment.succeeded" ? await markOrderPaid(payload.order_id, event) : await markOrderFailed(payload.order_id, { ...event, error: payload.error ?? "Thanh toán thất bại (mock)" });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  return NextResponse.json({ ok: true, alreadyProcessed: result.alreadyPaid });
}
