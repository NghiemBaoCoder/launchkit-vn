import { NextResponse, type NextRequest } from "next/server";
import { isVnpayConfigured } from "@/lib/payments/vnpay-provider";
import { processVnpayCallback } from "@/lib/payments/vnpay/process";
import { vnpParamsFrom } from "@/lib/payments/vnpay/sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * IPN của VNPay (server-to-server, GET với tham số vnp_*). Khai báo URL này trong
 * VNPay Merchant Portal: https://<domain>/api/payments/webhook/vnpay
 * Phải trả JSON { RspCode, Message } theo quy ước của VNPay.
 */
export async function GET(request: NextRequest) {
  if (!isVnpayConfigured()) return NextResponse.json({ RspCode: "99", Message: "VNPay not configured" });
  try {
    const result = await processVnpayCallback(vnpParamsFrom(request.nextUrl.searchParams));
    return NextResponse.json({ RspCode: result.rspCode, Message: result.message });
  } catch (e) {
    return NextResponse.json({ RspCode: "99", Message: e instanceof Error ? e.message : "Unknown error" });
  }
}
