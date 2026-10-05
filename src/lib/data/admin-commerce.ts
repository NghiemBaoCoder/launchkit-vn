import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Coupon, OrderStatus, PaymentStatus, Product } from "@/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export interface ProductFilters {
  q: string;
  kind: Product["kind"] | null;
  active: "active" | "inactive" | null;
  page: number;
}

export function parseProductFilters(sp: SearchParams): ProductFilters {
  return { q: paramStr(sp, "q"), kind: pickEnum(paramStr(sp, "kind"), ["free", "one_time", "subscription"] as const), active: pickEnum(paramStr(sp, "active"), ["active", "inactive"] as const), page: paramPage(sp) };
}

export async function listProductsAdmin(f: ProductFilters): Promise<ListResult<Product>> {
  const supabase = await createClient();
  let query = supabase.from("products").select("*", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (f.kind) query = query.eq("kind", f.kind);
  if (f.active) query = query.eq("active", f.active === "active");
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("sort_order").order("name").range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList(f.page);
    throw new Error(error.message);
  }
  return { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
}

/** Tất cả sản phẩm (cho select/checkbox trong form). */
export const getAllProducts = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, name, slug, kind, price, active").order("sort_order");
  return data ?? [];
});

export const getProductAdmin = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) return null;
  const [{ count: paidCount }, { data: paidRows }, { count: entitlementCount }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("product_id", id).eq("status", "paid"),
    supabase.from("orders").select("total").eq("product_id", id).eq("status", "paid").limit(5000),
    supabase.from("entitlements").select("id", { count: "exact", head: true }).eq("product_id", id),
  ]);
  const revenue = (paidRows ?? []).reduce((s, r) => s + (r.total ?? 0), 0);
  return { product, stats: { paidCount: paidCount ?? 0, revenue, entitlementCount: entitlementCount ?? 0 } };
});

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const ORDER_STATUSES = ["pending", "paid", "failed", "expired", "refunded"] as const;

export interface OrderFilters {
  q: string;
  status: OrderStatus | null;
  page: number;
}

export function parseOrderFilters(sp: SearchParams): OrderFilters {
  return { q: paramStr(sp, "q"), status: pickEnum(paramStr(sp, "status"), ORDER_STATUSES), page: paramPage(sp) };
}

/** Tìm user id theo email/tên để hỗ trợ tìm đơn hàng theo khách. */
async function findUserIds(q: string, limit = 50): Promise<string[]> {
  const supabase = await createClient();
  const term = likeTerm(q);
  const { data } = await supabase.from("profiles").select("id").or(`email.ilike.${term},full_name.ilike.${term}`).limit(limit);
  return (data ?? []).map((r) => r.id);
}

export async function listOrders(f: OrderFilters) {
  const supabase = await createClient();
  let query = supabase.from("orders").select("id, order_number, status, total, discount, currency, payment_method, coupon_code, created_at, paid_at, user_id, profiles(email, full_name), products(name)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    const ids = await findUserIds(f.q);
    const parts = [`order_number.ilike.${term}`, `coupon_code.ilike.${term}`];
    if (ids.length) parts.push(`user_id.in.(${ids.join(",")})`);
    if (/^[0-9a-f-]{36}$/i.test(f.q)) parts.push(`id.eq.${f.q}`, `business_id.eq.${f.q}`);
    query = query.or(parts.join(","));
  }
  if (f.status) query = query.eq("status", f.status);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}

export const getOrderDetail = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, profiles(id, email, full_name), products(id, name, slug, kind), businesses(id, name), coupons(id, code, type, value)").eq("id", id).maybeSingle();
  if (!order) return null;
  const [items, payments, entitlements, commission, redemption, subscription] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    supabase.from("entitlements").select("id, key, business_id, expires_at, created_at").eq("order_id", id),
    supabase.from("commissions").select("id, amount, rate, status, affiliate_id, affiliates(code)").eq("order_id", id).maybeSingle(),
    supabase.from("coupon_redemptions").select("id, created_at").eq("order_id", id).maybeSingle(),
    supabase.from("subscriptions").select("id, status, current_period_end").eq("order_id", id).maybeSingle(),
  ]);
  return { order, items: items.data ?? [], payments: payments.data ?? [], entitlements: entitlements.data ?? [], commission: commission.data ?? null, redemption: redemption.data ?? null, subscription: subscription.data ?? null };
});

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

const PAYMENT_STATUSES = ["pending", "processing", "succeeded", "failed", "refunded"] as const;

export interface PaymentFilters {
  q: string;
  status: PaymentStatus | null;
  provider: string;
  page: number;
}

export function parsePaymentFilters(sp: SearchParams): PaymentFilters {
  return { q: paramStr(sp, "q"), status: pickEnum(paramStr(sp, "status"), PAYMENT_STATUSES), provider: paramStr(sp, "provider").slice(0, 40), page: paramPage(sp) };
}

export async function listPayments(f: PaymentFilters) {
  const supabase = await createClient();
  let query = supabase.from("payments").select("id, provider, provider_ref, amount, currency, status, error, created_at, order_id, user_id, orders(order_number), profiles(email, full_name)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    const ids = await findUserIds(f.q);
    const parts = [`provider_ref.ilike.${term}`];
    if (ids.length) parts.push(`user_id.in.(${ids.join(",")})`);
    if (/^[0-9a-f-]{36}$/i.test(f.q)) parts.push(`id.eq.${f.q}`, `order_id.eq.${f.q}`);
    // Tìm theo mã đơn
    const { data: orders } = await supabase.from("orders").select("id").ilike("order_number", term).limit(50);
    if (orders?.length) parts.push(`order_id.in.(${orders.map((o) => o.id).join(",")})`);
    query = query.or(parts.join(","));
  }
  if (f.status) query = query.eq("status", f.status);
  if (f.provider) query = query.eq("provider", f.provider);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}

/** Danh sách cổng thanh toán đã xuất hiện trong dữ liệu. */
export const getPaymentProviders = cache(async (): Promise<string[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("provider").order("created_at", { ascending: false }).limit(500);
  return Array.from(new Set(["mock", ...(data ?? []).map((r) => r.provider)]));
});

export const getPaymentDetail = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("*, orders(id, order_number, status, total, product_id, products(name)), profiles(id, email, full_name)").eq("id", id).maybeSingle();
  return data ?? null;
});

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

export interface CouponFilters {
  q: string;
  active: "active" | "inactive" | null;
  type: "fixed" | "percentage" | null;
  page: number;
}

export function parseCouponFilters(sp: SearchParams): CouponFilters {
  return { q: paramStr(sp, "q"), active: pickEnum(paramStr(sp, "active"), ["active", "inactive"] as const), type: pickEnum(paramStr(sp, "type"), ["fixed", "percentage"] as const), page: paramPage(sp) };
}

export type CouponState = "expired" | "not_started" | "exhausted" | "valid";

function couponState(c: Coupon, now: number): CouponState {
  if (c.expires_at && new Date(c.expires_at).getTime() < now) return "expired";
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return "not_started";
  if (c.usage_limit != null && c.used_count >= c.usage_limit) return "exhausted";
  return "valid";
}

export async function listCoupons(f: CouponFilters): Promise<ListResult<Coupon & { state: CouponState }>> {
  const supabase = await createClient();
  let query = supabase.from("coupons").select("*", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`code.ilike.${term},description.ilike.${term}`);
  }
  if (f.active) query = query.eq("active", f.active === "active");
  if (f.type) query = query.eq("type", f.type);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList(f.page);
    throw new Error(error.message);
  }
  const now = Date.now();
  return { items: (data ?? []).map((c) => ({ ...c, state: couponState(c, now) })), total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
}
