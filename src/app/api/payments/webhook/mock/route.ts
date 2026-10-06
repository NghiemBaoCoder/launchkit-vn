import { NextResponse, type NextRequest } from "next/server";
import { MOCK_SIGNATURE_HEADER } from "@/lib/payments";
import { processMockWebhook } from "@/lib/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook của cổng thanh toán mock. Không cần cookie đăng nhập — xác thực bằng chữ ký HMAC.
 * Idempotent: gọi lại nhiều lần cho cùng đơn không cấp quyền lần hai.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get(MOCK_SIGNATURE_HEADER) ?? "";
  const result = await processMockWebhook(rawBody, signature);
  return NextResponse.json(result.body, { status: result.status });
}
