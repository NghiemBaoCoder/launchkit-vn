import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/data/activity";
import { env } from "@/lib/env";
import { fail, ok, type ActionResult, type JsonValue, type Order, type Payment, type Product, type Profile } from "@/types";
import { getPaymentProvider } from "./index";
import { markOrderPaid } from "./fulfill";
import { computeTotal, effectivePrice, validateCoupon } from "./pricing";

export const ORDER_TTL_HOURS = 24;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string | null | undefined): s is string {
  return !!s && UUID_RE.test(s);
}

/** Tìm sản phẩm đang bán theo slug hoặc id (products public-read). */
export async function findActiveProduct(slugOrId: string): Promise<Product | null> {
  const supabase = await createClient();
  const q = supabase.from("products").select("*").eq("active", true);
  const { data } = await (isUuid(slugOrId) ? q.eq("id", slugOrId) : q.eq("slug", slugOrId)).maybeSingle();
  return data ?? null;
}

export type OwnershipInfo = { owned: boolean; missing: string[]; activeSubscriptionId: string | null };

/** Người dùng đã có đủ entitlement của sản phẩm (theo scope) chưa? */
export async function checkOwnership(userId: string, product: Product, businessId: string | null): Promise<OwnershipInfo> {
  const supabase = await createClient();
  const scopeBusiness = product.entitlement_scope === "business";
  let q = supabase.from("entitlements").select("key, expires_at").eq("user_id", userId);
  q = scopeBusiness && businessId ? q.eq("business_id", businessId) : q.is("business_id", null);
  const [{ data: rows }, subRes] = await Promise.all([
    q,
    product.kind === "subscription"
      ? supabase.from("subscriptions").select("id, current_period_end").eq("user_id", userId).eq("product_id", product.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const now = Date.now();
  const have = new Set((rows ?? []).filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now).map((r) => r.key));
  const keys = product.entitlements ?? [];
  const missing = keys.filter((k) => !have.has(k));
  const sub = subRes.data as { id: string; current_period_end: string } | null;
  const activeSubscriptionId = sub && new Date(sub.current_period_end).getTime() > now ? sub.id : null;
  return { owned: keys.length > 0 && missing.length === 0, missing, activeSubscriptionId };
}

export interface CreateOrderInput {
  product: Product;
  businessId: string | null;
  couponCode?: string | null;
  acceptTerms: boolean;
  /** Cho phép mua lại gói subscription đang hoạt động (gia hạn sớm). */
  allowRenewal?: boolean;
}

export interface CreateOrderOutput {
  orderId: string;
  paymentId: string | null;
  total: number;
  redirectTo: string;
}

/**
 * Tạo đơn + order_item + payment cho user. Đã kiểm tra quyền sở hữu business, trùng gói, mã giảm giá.
 * Tổng = 0 → đánh dấu đã thanh toán ngay; ngược lại chuyển sang cổng thanh toán.
 */
export async function createOrderForUser(profile: Profile, input: CreateOrderInput): Promise<ActionResult<CreateOrderOutput>> {
  const { product } = input;
  if (!input.acceptTerms) return fail("Bạn cần đồng ý Điều khoản sử dụng và Chính sách hoàn tiền để tiếp tục.", "terms");
  if (product.kind === "free") return fail("Gói miễn phí không cần thanh toán.", "validation");

  const supabase = await createClient();
  const admin = createAdminClient();
  const scopeBusiness = product.entitlement_scope === "business";
  let businessId: string | null = null;
  let businessName: string | null = null;

  if (scopeBusiness) {
    if (!isUuid(input.businessId)) return fail("Vui lòng chọn business để áp dụng gói này.", "business_required");
    const { data: biz } = await supabase.from("businesses").select("id, name, user_id, status").eq("id", input.businessId).maybeSingle();
    if (!biz || biz.user_id !== profile.id) return fail("Không tìm thấy business hoặc bạn không có quyền.", "forbidden");
    if (biz.status === "archived") return fail("Business này đã được lưu trữ. Khôi phục trước khi mua gói.", "validation");
    businessId = biz.id;
    businessName = biz.name;
  }

  const ownership = await checkOwnership(profile.id, product, businessId);
  if (ownership.owned && !(product.kind === "subscription" && input.allowRenewal)) {
    return fail(scopeBusiness ? "Bạn đã sở hữu gói này cho business này" : "Bạn đã sở hữu gói này", "already_owned");
  }
  if (product.kind === "subscription" && ownership.activeSubscriptionId && !input.allowRenewal) {
    return fail("Bạn đang có gói Pro Membership hoạt động. Quản lý gia hạn tại trang Gói & thanh toán.", "already_subscribed");
  }

  const subtotal = effectivePrice(product);
  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  const code = (input.couponCode ?? "").trim().toUpperCase();
  if (code) {
    const { data: coupon } = await admin.from("coupons").select("*").ilike("code", code).maybeSingle();
    if (!coupon) return fail("Mã giảm giá không tồn tại.", "coupon");
    const { count } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", coupon.id).eq("user_id", profile.id);
    const v = validateCoupon(coupon, { subtotal, productId: product.id, now: new Date(), userRedemptions: count ?? 0 });
    if (!v.ok) return fail(v.reason, "coupon");
    discount = v.discount;
    couponId = coupon.id;
    couponCode = coupon.code;
  }
  const total = computeTotal(subtotal, discount);

  // Affiliate: người giới thiệu của buyer (profiles.referred_by) phải có affiliate đã duyệt
  let affiliateId: string | null = null;
  if (profile.referred_by && profile.referred_by !== profile.id) {
    const { data: aff } = await admin.from("affiliates").select("id, status").eq("user_id", profile.referred_by).maybeSingle();
    if (aff && aff.status === "approved") affiliateId = aff.id;
  }

  const { data: orderNumber, error: numErr } = await admin.rpc("next_order_number");
  if (numErr || !orderNumber) return fail(numErr?.message ?? "Không tạo được mã đơn hàng");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ORDER_TTL_HOURS * 60 * 60 * 1000);

  // Đơn pending cũ của cùng sản phẩm/business bị thay thế bởi đơn mới
  {
    let stale = admin.from("orders").update({ status: "expired" }).eq("user_id", profile.id).eq("product_id", product.id).eq("status", "pending");
    stale = businessId ? stale.eq("business_id", businessId) : stale.is("business_id", null);
    await stale;
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: profile.id,
      business_id: businessId,
      product_id: product.id,
      status: "pending",
      subtotal,
      discount,
      total,
      currency: product.currency || "VND",
      coupon_id: couponId,
      coupon_code: couponCode,
      payment_method: "mock",
      affiliate_id: affiliateId,
      terms_accepted_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      metadata: { product_slug: product.slug, business_name: businessName, renewal: !!input.allowRenewal } as JsonValue,
    })
    .select("id")
    .single();
  if (orderErr || !order) return fail(orderErr?.message ?? "Không tạo được đơn hàng");

  const { error: itemErr } = await admin.from("order_items").insert({ order_id: order.id, product_id: product.id, name: product.name, unit_price: subtotal, quantity: 1, total: subtotal });
  if (itemErr) return fail(itemErr.message);

  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({ order_id: order.id, user_id: profile.id, provider: "mock", amount: total, currency: product.currency || "VND", status: "pending" })
    .select("id")
    .single();
  if (payErr || !payment) return fail(payErr?.message ?? "Không tạo được giao dịch");

  await logActivity({ userId: profile.id, businessId, action: "order.created", entityType: "order", entityId: order.id, title: `Tạo đơn ${orderNumber} — ${product.name}`, metadata: { product_slug: product.slug, total, coupon: couponCode } });

  if (total === 0) {
    const res = await markOrderPaid(order.id, { provider: "mock", providerRef: `free-${order.id}`, rawEvent: { reason: "zero_total", coupon: couponCode } });
    if (!res.ok) return fail(res.error);
    return ok({ orderId: order.id, paymentId: payment.id, total, redirectTo: `/payment/success?order=${order.id}` });
  }

  const provider = getPaymentProvider("mock");
  const { redirectUrl } = await provider.createPayment({ orderId: order.id, paymentId: payment.id, amount: total, currency: product.currency || "VND", returnUrl: `${env.appUrl}/payment/pending?order=${order.id}` });
  return ok({ orderId: order.id, paymentId: payment.id, total, redirectTo: redirectUrl });
}

export type OrderDetail = Order & {
  products: Pick<Product, "id" | "name" | "slug" | "entitlement_scope" | "kind" | "credits"> | null;
  businesses: { id: string; name: string } | null;
  payments: Pick<Payment, "id" | "status" | "provider" | "provider_ref" | "amount" | "created_at" | "error">[];
};

/** Đơn hàng của user hiện tại (RLS) kèm sản phẩm, business, giao dịch. */
export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  if (!isUuid(orderId)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, products(id, name, slug, entitlement_scope, kind, credits), businesses(id, name), payments(id, status, provider, provider_ref, amount, created_at, error)")
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  const detail = data as unknown as OrderDetail;
  detail.payments = [...(detail.payments ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return detail;
}

/** Giao dịch pending mới nhất của đơn (nếu có). */
export function pendingPaymentOf(order: OrderDetail) {
  return order.payments.find((p) => p.status === "pending" || p.status === "processing") ?? null;
}

/** Link tiếp tục thanh toán cho đơn pending. */
export function resumePaymentHref(order: OrderDetail): string {
  const p = pendingPaymentOf(order);
  return p ? `/checkout/pay/${p.id}` : `/payment/pending?order=${order.id}`;
}

/** Link mua lại cùng sản phẩm/business. */
export function retryCheckoutHref(order: OrderDetail): string {
  const slug = order.products?.slug ?? (order.metadata as { product_slug?: string } | null)?.product_slug ?? "business-kit";
  return order.business_id ? `/checkout/${slug}?business=${order.business_id}` : `/checkout/${slug}`;
}

/** Link đích sau khi mua thành công. */
export function successHref(order: OrderDetail): string {
  return order.business_id ? `/business/${order.business_id}/overview` : "/dashboard/billing";
}
