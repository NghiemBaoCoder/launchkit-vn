import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { asRecord } from "./admin-shared";

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  revenue: number;
  revenue_prev: number;
  orders: number;
  orders_prev: number;
  paid_orders: number;
  users: number;
  new_users: number;
  new_users_prev: number;
  businesses: number;
  new_businesses: number;
  generations: number;
  generation_credits: number;
  generation_failed: number;
  aov: number;
  conversion: number;
  top_industries: { name: string; count: number }[];
  top_products: { name: string; count: number; revenue: number }[];
  revenue_series: RevenuePoint[];
}

export interface FunnelStats {
  landing: number;
  generator_start: number;
  generator_complete: number;
  signup: number;
  preview: number;
  checkout: number;
  purchase: number;
  top_sources: { source: string; count: number }[];
  repeat_customers: number;
  kit_conversion: number;
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Thống kê tổng quan (RPC `admin_dashboard_stats`, RLS: chỉ admin). */
export const getDashboardStats = cache(async (days: number): Promise<DashboardStats> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats", { p_days: days });
  if (error) throw new Error(`Không tải được thống kê: ${error.message}`);
  const r = asRecord(data);
  return {
    revenue: num(r.revenue),
    revenue_prev: num(r.revenue_prev),
    orders: num(r.orders),
    orders_prev: num(r.orders_prev),
    paid_orders: num(r.paid_orders),
    users: num(r.users),
    new_users: num(r.new_users),
    new_users_prev: num(r.new_users_prev),
    businesses: num(r.businesses),
    new_businesses: num(r.new_businesses),
    generations: num(r.generations),
    generation_credits: num(r.generation_credits),
    generation_failed: num(r.generation_failed),
    aov: num(r.aov),
    conversion: num(r.conversion),
    top_industries: arr(r.top_industries).map((x) => ({ name: str(asRecord(x).name) || "Khác", count: num(asRecord(x).count) })),
    top_products: arr(r.top_products).map((x) => ({ name: str(asRecord(x).name), count: num(asRecord(x).count), revenue: num(asRecord(x).revenue) })),
    revenue_series: arr(r.revenue_series).map((x) => ({ date: str(asRecord(x).date), revenue: num(asRecord(x).revenue), orders: num(asRecord(x).orders) })),
  };
});

/** Phễu chuyển đổi (RPC `admin_funnel`). */
export const getFunnelStats = cache(async (days: number): Promise<FunnelStats> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_funnel", { p_days: days });
  if (error) throw new Error(`Không tải được phễu: ${error.message}`);
  const r = asRecord(data);
  return {
    landing: num(r.landing),
    generator_start: num(r.generator_start),
    generator_complete: num(r.generator_complete),
    signup: num(r.signup),
    preview: num(r.preview),
    checkout: num(r.checkout),
    purchase: num(r.purchase),
    top_sources: arr(r.top_sources).map((x) => ({ source: str(asRecord(x).source) || "direct", count: num(asRecord(x).count) })),
    repeat_customers: num(r.repeat_customers),
    kit_conversion: num(r.kit_conversion),
  };
});

/** 5 đơn hàng mới nhất kèm email khách. */
export const getRecentOrders = cache(async (limit = 5) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
});

/** 5 người dùng mới nhất. */
export const getRecentUsers = cache(async (limit = 5) => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, status, credits, created_at").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
});

/** Xu hướng so với kỳ trước (null nếu kỳ trước = 0). */
export function trendOf(current: number, previous: number): number | null {
  if (!previous) return null;
  return (current - previous) / previous;
}
