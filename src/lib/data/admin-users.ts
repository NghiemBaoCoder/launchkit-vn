import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

const ROLES = ["user", "admin", "super_admin"] as const;
const STATUSES = ["active", "suspended"] as const;

export interface UserFilters {
  q: string;
  role: UserRole | null;
  status: "active" | "suspended" | null;
  page: number;
}

export function parseUserFilters(sp: SearchParams): UserFilters {
  return { q: paramStr(sp, "q"), role: pickEnum(paramStr(sp, "role"), ROLES), status: pickEnum(paramStr(sp, "status"), STATUSES), page: paramPage(sp) };
}

export async function listUsers(f: UserFilters): Promise<ListResult<Profile>> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`email.ilike.${term},full_name.ilike.${term},phone.ilike.${term},referral_code.ilike.${term}`);
  }
  if (f.role) query = query.eq("role", f.role);
  if (f.status) query = query.eq("status", f.status);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList(f.page); // range ngoài phạm vi
    throw new Error(error.message);
  }
  return { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
}

/** Hồ sơ + dữ liệu liên quan của một người dùng (RLS: admin xem được). */
export const getUserDetail = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) return null;

  const [businesses, orders, payments, credits, entitlements, activity, affiliate, subscriptions, referrer] = await Promise.all([
    supabase.from("businesses").select("id, name, slug, status, created_at, generated_at, industries(name), business_types(name)").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("orders").select("id, order_number, status, total, created_at, paid_at, products(name)").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("payments").select("id, provider, provider_ref, amount, status, created_at, order_id").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("credit_transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("entitlements").select("id, key, source, business_id, order_id, expires_at, created_at, businesses(name), products(name)").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("activity_logs").select("id, action, title, entity_type, entity_id, business_id, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("affiliates").select("id, code, status, clicks, commission_rate").eq("user_id", id).maybeSingle(),
    supabase.from("subscriptions").select("id, status, current_period_start, current_period_end, cancel_at_period_end, products(name)").eq("user_id", id).order("created_at", { ascending: false }),
    profile.referred_by ? supabase.from("profiles").select("id, email, full_name").eq("id", profile.referred_by).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return {
    profile,
    businesses: businesses.data ?? [],
    orders: orders.data ?? [],
    payments: payments.data ?? [],
    credits: credits.data ?? [],
    entitlements: entitlements.data ?? [],
    activity: activity.data ?? [],
    affiliate: affiliate.data ?? null,
    subscriptions: subscriptions.data ?? [],
    referrer: referrer.data ?? null,
  };
});

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>;
