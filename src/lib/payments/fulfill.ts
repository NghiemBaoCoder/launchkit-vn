import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import type { JsonValue, Product } from "@/types";

/** Chu kỳ gói subscription (ngày). */
export const SUBSCRIPTION_PERIOD_DAYS = 30;

export interface PaymentEventInput {
  provider: string;
  providerRef: string;
  rawEvent: Record<string, unknown>;
}

export type FulfillResult = { ok: true; alreadyPaid: boolean } | { ok: false; error: string };

const UNIQUE_VIOLATION = "23505";

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Đánh dấu đơn đã thanh toán và cấp quyền. IDEMPOTENT: chuyển trạng thái bằng một UPDATE có điều kiện,
 * nếu đơn đã paid thì trả về ngay (không cấp quyền / cộng credits lần hai).
 */
export async function markOrderPaid(orderId: string, input: PaymentEventInput): Promise<FulfillResult> {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("*, products(*)").eq("id", orderId).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
  if (order.status === "paid") return { ok: true, alreadyPaid: true };
  if (order.status === "refunded") return { ok: false, error: "Đơn hàng đã hoàn tiền" };
  const product = order.products as Product | null;
  if (!product) return { ok: false, error: "Đơn hàng không có sản phẩm" };

  const now = new Date();
  // Chuyển trạng thái có điều kiện — chống xử lý trùng khi webhook gửi 2 lần song song.
  const { data: transitioned, error: upErr } = await admin
    .from("orders")
    .update({ status: "paid", paid_at: now.toISOString() })
    .eq("id", orderId)
    .neq("status", "paid")
    .select("id");
  if (upErr) return { ok: false, error: upErr.message };
  if (!transitioned || transitioned.length === 0) return { ok: true, alreadyPaid: true };

  await admin
    .from("payments")
    .update({ status: "succeeded", provider: input.provider, provider_ref: input.providerRef, raw_event: input.rawEvent as JsonValue, error: null })
    .eq("order_id", orderId)
    .neq("status", "succeeded");

  // Mã giảm giá: ghi nhận lượt dùng
  if (order.coupon_id) {
    const { error: redErr } = await admin.from("coupon_redemptions").insert({ coupon_id: order.coupon_id, user_id: order.user_id, order_id: orderId });
    if (!redErr) {
      const { data: c } = await admin.from("coupons").select("used_count").eq("id", order.coupon_id).maybeSingle();
      if (c) await admin.from("coupons").update({ used_count: (c.used_count ?? 0) + 1 }).eq("id", order.coupon_id);
    } else if (redErr.code !== UNIQUE_VIOLATION) {
      console.error("[fulfill] coupon_redemptions", redErr.message);
    }
  }

  // Subscription: tạo mới hoặc gia hạn gói đang hoạt động
  let periodEnd: Date | null = null;
  if (product.kind === "subscription") {
    const { data: activeSub } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", order.user_id)
      .eq("product_id", product.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const base = activeSub && new Date(activeSub.current_period_end).getTime() > now.getTime() ? new Date(activeSub.current_period_end) : now;
    periodEnd = addDays(base, SUBSCRIPTION_PERIOD_DAYS);
    if (activeSub) {
      await admin
        .from("subscriptions")
        .update({ current_period_start: base.toISOString(), current_period_end: periodEnd.toISOString(), cancel_at_period_end: false, canceled_at: null, order_id: orderId, provider: input.provider, provider_ref: input.providerRef })
        .eq("id", activeSub.id);
    } else {
      await admin.from("subscriptions").insert({
        user_id: order.user_id,
        product_id: product.id,
        order_id: orderId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        provider: input.provider,
        provider_ref: input.providerRef,
      });
    }
  }

  // Entitlements: chỉ chèn key còn thiếu (2 partial unique index nên không dùng upsert onConflict)
  const scopeBusiness = product.entitlement_scope === "business";
  const businessId = scopeBusiness ? order.business_id : null;
  const keys = product.entitlements ?? [];
  if (keys.length > 0 && (!scopeBusiness || businessId)) {
    let q = admin.from("entitlements").select("id, key, expires_at").eq("user_id", order.user_id);
    q = businessId ? q.eq("business_id", businessId) : q.is("business_id", null);
    const { data: existing } = await q;
    const existingKeys = new Set((existing ?? []).map((e) => e.key));
    const expiresAt = periodEnd ? periodEnd.toISOString() : null;
    const missing = keys.filter((k) => !existingKeys.has(k));
    if (missing.length > 0) {
      const { error: entErr } = await admin.from("entitlements").insert(
        missing.map((key) => ({ user_id: order.user_id, business_id: businessId, key, source: "purchase", order_id: orderId, product_id: product.id, expires_at: expiresAt })),
      );
      if (entErr && entErr.code !== UNIQUE_VIOLATION) console.error("[fulfill] entitlements", entErr.message);
    }
    // Gia hạn: kéo dài hạn cho các key có thời hạn đã tồn tại (không đụng key vĩnh viễn)
    if (expiresAt) {
      const renewIds = (existing ?? []).filter((e) => keys.includes(e.key) && e.expires_at !== null).map((e) => e.id);
      if (renewIds.length > 0) await admin.from("entitlements").update({ expires_at: expiresAt, order_id: orderId, product_id: product.id }).in("id", renewIds);
    }
  }

  // Credits
  if (product.credits > 0) {
    const { error: crErr } = await admin.rpc("adjust_credits", { p_user_id: order.user_id, p_amount: product.credits, p_reason: `Mua ${product.name}`, p_ref_type: "order", p_ref_id: orderId });
    if (crErr) console.error("[fulfill] adjust_credits", crErr.message);
  }

  // Hoa hồng affiliate
  if (order.affiliate_id && order.total > 0) {
    const { data: aff } = await admin.from("affiliates").select("id, commission_rate, status").eq("id", order.affiliate_id).maybeSingle();
    if (aff && aff.status === "approved") {
      const amount = Math.round((order.total * Number(aff.commission_rate)) / 100);
      const { error: comErr } = await admin.from("commissions").insert({ affiliate_id: aff.id, order_id: orderId, amount, rate: aff.commission_rate, status: "pending" });
      if (comErr && comErr.code !== UNIQUE_VIOLATION) console.error("[fulfill] commissions", comErr.message);
    }
  }

  const workspaceHref = businessId ? `/business/${businessId}/overview` : "/dashboard/billing";
  await Promise.all([
    createNotification(order.user_id, { type: "payment_success", title: "Thanh toán thành công", body: `Đơn ${order.order_number} — ${product.name} đã được thanh toán.`, href: "/dashboard/purchases" }),
    createNotification(order.user_id, { type: "kit_unlocked", title: `Đã mở khoá ${product.name}`, body: product.credits > 0 ? `Bạn được cộng ${product.credits} credits.` : undefined, href: workspaceHref }),
    logActivity({ userId: order.user_id, businessId: businessId ?? undefined, action: "purchase.completed", entityType: "order", entityId: orderId, title: `Thanh toán ${product.name} (${order.order_number})`, metadata: { product_slug: product.slug, total: order.total, provider: input.provider, provider_ref: input.providerRef } }),
  ]);

  return { ok: true, alreadyPaid: false };
}

/** Đánh dấu thanh toán thất bại. Không hạ cấp đơn đã paid. */
export async function markOrderFailed(orderId: string, input: PaymentEventInput & { error?: string }): Promise<FulfillResult> {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("id, user_id, status, order_number, business_id, products(name, slug)").eq("id", orderId).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
  if (order.status === "paid" || order.status === "refunded") return { ok: true, alreadyPaid: true };

  await admin
    .from("payments")
    .update({ status: "failed", provider: input.provider, provider_ref: input.providerRef, raw_event: input.rawEvent as JsonValue, error: input.error ?? "Thanh toán thất bại" })
    .eq("order_id", orderId)
    .in("status", ["pending", "processing"]);
  if (order.status === "pending") {
    await admin.from("orders").update({ status: "failed" }).eq("id", orderId).eq("status", "pending");
  }
  const productName = (order.products as { name: string } | null)?.name ?? "sản phẩm";
  await Promise.all([
    createNotification(order.user_id, { type: "payment_failed", title: "Thanh toán thất bại", body: `Đơn ${order.order_number} — ${productName} chưa được thanh toán. Bạn có thể thử lại.`, href: `/payment/failed?order=${orderId}` }),
    logActivity({ userId: order.user_id, businessId: order.business_id ?? undefined, action: "purchase.failed", entityType: "order", entityId: orderId, title: `Thanh toán thất bại (${order.order_number})`, metadata: { provider: input.provider, provider_ref: input.providerRef, error: input.error ?? null } }),
  ]);
  return { ok: true, alreadyPaid: false };
}

/** Đánh dấu các đơn pending quá hạn là expired (gọi trước khi hiển thị danh sách/kết quả). */
export async function expireStaleOrders(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("expire_stale_orders");
    if (error) {
      console.error("[fulfill] expire_stale_orders", error.message);
      return 0;
    }
    return data ?? 0;
  } catch (e) {
    console.error("[fulfill] expire_stale_orders", e);
    return 0;
  }
}
