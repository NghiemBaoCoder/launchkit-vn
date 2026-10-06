"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthError, requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { signMockPayload } from "@/lib/payments/mock-provider";
import { processMockWebhook } from "@/lib/payments/webhook";
import { checkOwnership, createOrderForUser, findActiveProduct, isUuid } from "@/lib/payments/orders";
import { computeTotal, effectivePrice, validateCoupon } from "@/lib/payments/pricing";
import { randomToken } from "@/lib/utils";
import { fail, ok, type ActionResult, type OrderStatus, type PaymentStatus } from "@/types";

function authFail(e: unknown): ActionResult<never> {
  if (e instanceof AuthError) return fail(e.message, e.code);
  return fail(e instanceof Error ? e.message : "Đã xảy ra lỗi, vui lòng thử lại.");
}

const previewSchema = z.object({
  productSlug: z.string().trim().min(1).max(80),
  code: z.string().trim().min(1, "Nhập mã giảm giá").max(40),
  businessId: z.string().uuid().optional().nullable(),
});

export interface CouponPreview {
  discount: number;
  subtotal: number;
  total: number;
  coupon: { code: string; description: string | null };
}

/** Xem trước mã giảm giá cho sản phẩm (không tạo đơn). */
export async function previewCouponAction(input: { productSlug: string; code: string; businessId?: string | null }): Promise<ActionResult<CouponPreview>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const parsed = previewSchema.safeParse(input);
  if (!parsed.success) return fail("Mã giảm giá không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const product = await findActiveProduct(parsed.data.productSlug);
  if (!product) return fail("Sản phẩm không tồn tại", "not_found");

  const admin = createAdminClient();
  const code = parsed.data.code.toUpperCase();
  const { data: coupon } = await admin.from("coupons").select("*").ilike("code", code).maybeSingle();
  if (!coupon) return fail("Mã giảm giá không tồn tại.", "coupon");
  const { count } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", coupon.id).eq("user_id", profile.id);
  const subtotal = effectivePrice(product);
  const v = validateCoupon(coupon, { subtotal, productId: product.id, now: new Date(), userRedemptions: count ?? 0 });
  if (!v.ok) return fail(v.reason, "coupon");
  return ok({ discount: v.discount, subtotal, total: computeTotal(subtotal, v.discount), coupon: { code: coupon.code, description: coupon.description } }, "Đã áp dụng mã giảm giá");
}

const createOrderSchema = z.object({
  productSlug: z.string().trim().min(1).max(80),
  businessId: z.string().uuid().optional().nullable(),
  couponCode: z.string().trim().max(40).optional().nullable(),
  acceptTerms: z.boolean(),
});

/** Tạo đơn hàng và trả về đường dẫn tiếp theo (cổng thanh toán hoặc trang thành công nếu tổng = 0). */
export async function createOrderAction(input: { productSlug: string; businessId?: string | null; couponCode?: string | null; acceptTerms: boolean }): Promise<ActionResult<{ orderId: string; redirectTo: string }>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin đơn hàng không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const product = await findActiveProduct(parsed.data.productSlug);
  if (!product) return fail("Sản phẩm không tồn tại hoặc đã ngừng bán.", "not_found");

  const res = await createOrderForUser(profile, {
    product,
    businessId: parsed.data.businessId ?? null,
    couponCode: parsed.data.couponCode ?? null,
    acceptTerms: parsed.data.acceptTerms,
  });
  if (!res.ok) return res;
  revalidatePath("/dashboard/purchases");
  return ok({ orderId: res.data.orderId, redirectTo: res.data.redirectTo }, res.data.total === 0 ? "Đơn hàng miễn phí đã được kích hoạt" : "Đã tạo đơn hàng");
}

/** Kiểm tra quyền sở hữu gói (dùng ở trang checkout để hiển thị trạng thái). */
export async function checkOwnershipAction(input: { productSlug: string; businessId?: string | null }): Promise<ActionResult<{ owned: boolean; activeSubscriptionId: string | null }>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const product = await findActiveProduct(input.productSlug);
  if (!product) return fail("Sản phẩm không tồn tại", "not_found");
  const o = await checkOwnership(profile.id, product, isUuid(input.businessId) ? input.businessId : null);
  return ok({ owned: o.owned, activeSubscriptionId: o.activeSubscriptionId });
}

export interface OrderStatusInfo {
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  paymentId: string | null;
}

/** Trạng thái đơn hàng (để polling ở trang chờ). */
export async function getOrderStatusAction(orderId: string): Promise<ActionResult<OrderStatusInfo>> {
  try {
    await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  if (!isUuid(orderId)) return fail("Mã đơn hàng không hợp lệ", "validation");
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("id, status, expires_at, payments(id, status, created_at)").eq("id", orderId).maybeSingle();
  if (!order) return fail("Không tìm thấy đơn hàng", "not_found");
  const payments = [...(order.payments ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latest = payments[0] ?? null;
  let status = order.status;
  if (status === "pending" && new Date(order.expires_at).getTime() < Date.now()) {
    // Đơn quá hạn: đánh dấu ngay để UI không chờ vô ích
    const admin = createAdminClient();
    await admin.from("orders").update({ status: "expired" }).eq("id", orderId).eq("status", "pending");
    status = "expired";
  }
  return ok({ status, paymentStatus: latest?.status ?? null, paymentId: latest && (latest.status === "pending" || latest.status === "processing") ? latest.id : null });
}

/** Huỷ đơn đang chờ thanh toán (chỉ đơn của mình). */
export async function cancelOrderAction(orderId: string): Promise<ActionResult<undefined>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  if (!isUuid(orderId)) return fail("Mã đơn hàng không hợp lệ", "validation");
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("id, status, user_id, order_number, business_id").eq("id", orderId).maybeSingle();
  if (!order || order.user_id !== profile.id) return fail("Không tìm thấy đơn hàng", "not_found");
  if (order.status !== "pending") return fail("Chỉ huỷ được đơn đang chờ thanh toán.", "invalid_state");
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status: "expired" }).eq("id", orderId).eq("status", "pending");
  if (error) return fail(error.message);
  await admin.from("payments").update({ status: "failed", error: "Người dùng huỷ đơn" }).eq("order_id", orderId).in("status", ["pending", "processing"]);
  await logActivity({ userId: profile.id, businessId: order.business_id, action: "order.canceled", entityType: "order", entityId: orderId, title: `Huỷ đơn ${order.order_number}` });
  revalidatePath("/dashboard/purchases");
  revalidatePath("/payment/pending");
  return ok(undefined, "Đã huỷ đơn hàng");
}

const outcomeSchema = z.enum(["success", "failed"]);

/**
 * Giả lập kết quả từ cổng thanh toán mock: dựng payload webhook, ký HMAC và POST tới
 * /api/payments/webhook/mock của chính app — để đường webhook thật được chạy.
 */
export async function simulateMockPaymentAction(paymentId: string, outcome: "success" | "failed"): Promise<ActionResult<{ redirectTo: string }>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const parsedOutcome = outcomeSchema.safeParse(outcome);
  if (!parsedOutcome.success || !isUuid(paymentId)) return fail("Yêu cầu không hợp lệ", "validation");

  const supabase = await createClient();
  const { data: payment } = await supabase.from("payments").select("id, order_id, user_id, status, amount, orders(id, status, expires_at)").eq("id", paymentId).maybeSingle();
  if (!payment || payment.user_id !== profile.id) return fail("Không tìm thấy giao dịch", "not_found");
  const order = payment.orders as { id: string; status: OrderStatus; expires_at: string } | null;
  if (!order) return fail("Giao dịch không gắn với đơn hàng nào", "not_found");
  if (order.status === "paid") return ok({ redirectTo: `/payment/success?order=${order.id}` }, "Đơn hàng đã được thanh toán");
  if (order.status === "expired" || new Date(order.expires_at).getTime() < Date.now()) {
    if (order.status === "pending") await createAdminClient().from("orders").update({ status: "expired" }).eq("id", order.id).eq("status", "pending");
    return ok({ redirectTo: `/payment/failed?order=${order.id}&reason=expired` });
  }
  if (payment.status !== "pending" || order.status !== "pending") return fail("Giao dịch này đã được xử lý.", "invalid_state");

  const payload = {
    event: parsedOutcome.data === "success" ? "payment.succeeded" : "payment.failed",
    payment_id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    provider_ref: `MOCK-${randomToken(10).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    ...(parsedOutcome.data === "failed" ? { error: "Ngân hàng từ chối giao dịch (mock)" } : {}),
  };
  const raw = JSON.stringify(payload);
  const signature = signMockPayload(raw);
  // Gọi thẳng bộ xử lý webhook trong cùng tiến trình (vẫn xác thực chữ ký) — không phụ thuộc
  // self-fetch qua mạng, vốn hay lỗi trên serverless khi NEXT_PUBLIC_APP_URL sai hoặc bị chặn.
  const result = await processMockWebhook(raw, signature);
  if (!result.body.ok) {
    return fail(`Cổng thanh toán mock trả về lỗi ${result.status}${result.body.error ? `: ${result.body.error}` : ""}`);
  }
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/billing");
  revalidatePath("/", "layout");
  return ok({ redirectTo: parsedOutcome.data === "success" ? `/payment/success?order=${order.id}` : `/payment/failed?order=${order.id}` });
}
