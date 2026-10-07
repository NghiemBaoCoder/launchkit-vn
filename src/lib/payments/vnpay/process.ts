import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { markOrderFailed, markOrderPaid } from "../fulfill";
import { vnpayConfig } from "../vnpay-provider";
import { vnpIsSuccess, vnpMessage, vnpVerify } from "./sign";

/** Mã phản hồi IPN theo tài liệu VNPay. */
export type VnpIpnCode = "00" | "01" | "02" | "04" | "97" | "99";

export interface VnpayProcessResult {
  rspCode: VnpIpnCode;
  message: string;
  orderId: string | null;
  /** Đơn đã ở trạng thái paid (sau khi xử lý hoặc đã paid từ trước). */
  paid: boolean;
  /** Mã vnp_ResponseCode nhận được. */
  responseCode: string | undefined;
}

/**
 * Xử lý tham số VNPay gửi về (ReturnUrl hoặc IPN) — dùng chung cho cả hai đường vì đều ký HMAC
 * với vnp_HashSecret. IDEMPOTENT: gọi lại nhiều lần không cấp quyền hai lần (trả "02").
 */
export async function processVnpayCallback(params: Record<string, string>): Promise<VnpayProcessResult> {
  const { hashSecret } = vnpayConfig();
  const txnRef = params.vnp_TxnRef ?? "";
  const responseCode = params.vnp_ResponseCode;
  if (!vnpVerify(params, hashSecret)) return { rspCode: "97", message: "Invalid Checksum", orderId: null, paid: false, responseCode };

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("id, order_id, amount, status, orders(status)").eq("provider", "vnpay").eq("provider_ref", txnRef).maybeSingle();
  if (!payment) return { rspCode: "01", message: "Order not Found", orderId: null, paid: false, responseCode };

  const order = payment.orders as { status: string } | null;
  const expectedAmount = Math.round(Number(payment.amount)) * 100;
  if (Number(params.vnp_Amount) !== expectedAmount) return { rspCode: "04", message: "Invalid amount", orderId: payment.order_id, paid: order?.status === "paid", responseCode };

  if (order?.status === "paid" || payment.status === "succeeded") return { rspCode: "02", message: "Order already confirmed", orderId: payment.order_id, paid: true, responseCode };

  const event = { provider: "vnpay", providerRef: txnRef, rawEvent: { ...params, vnp_SecureHash: undefined } as Record<string, unknown> };
  if (vnpIsSuccess(params)) {
    const res = await markOrderPaid(payment.order_id, event);
    if (!res.ok) return { rspCode: "99", message: res.error, orderId: payment.order_id, paid: false, responseCode };
    return { rspCode: res.alreadyPaid ? "02" : "00", message: res.alreadyPaid ? "Order already confirmed" : "Confirm Success", orderId: payment.order_id, paid: true, responseCode };
  }

  // Giao dịch không thành công / bị huỷ: ghi nhận thất bại nhưng vẫn xác nhận đã nhận IPN.
  if (order?.status === "pending") {
    const res = await markOrderFailed(payment.order_id, { ...event, error: vnpMessage(responseCode) });
    if (!res.ok) return { rspCode: "99", message: res.error, orderId: payment.order_id, paid: false, responseCode };
  }
  return { rspCode: "00", message: "Confirm Success", orderId: payment.order_id, paid: false, responseCode };
}
