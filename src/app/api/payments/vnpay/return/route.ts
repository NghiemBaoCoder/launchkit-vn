import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { isVnpayConfigured } from "@/lib/payments/vnpay-provider";
import { processVnpayCallback } from "@/lib/payments/vnpay/process";
import { vnpParamsFrom } from "@/lib/payments/vnpay/sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * vnp_ReturnUrl: VNPay chuyển trình duyệt người dùng về đây sau khi thanh toán.
 * Xác thực chữ ký rồi cập nhật đơn (idempotent với IPN) và chuyển tới trang kết quả.
 */
export async function GET(request: NextRequest) {
  const to = (path: string) => NextResponse.redirect(new URL(path, env.appUrl), { status: 303 });
  if (!isVnpayConfigured()) return to("/dashboard/purchases?vnpay=unconfigured");
  try {
    const result = await processVnpayCallback(vnpParamsFrom(request.nextUrl.searchParams));
    if (result.rspCode === "97") return to("/dashboard/purchases?vnpay=invalid-signature");
    if (!result.orderId) return to("/dashboard/purchases?vnpay=not-found");
    if (result.paid) return to(`/payment/success?order=${result.orderId}`);
    if (result.rspCode === "04") return to(`/payment/pending?order=${result.orderId}&vnpay=amount-mismatch`);
    return to(`/payment/failed?order=${result.orderId}&reason=vnpay&code=${encodeURIComponent(result.responseCode ?? "99")}`);
  } catch {
    return to("/dashboard/purchases?vnpay=error");
  }
}
