import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

const STATUSES = ["pending", "approved", "rejected", "paid"] as const;
export type AffiliateStatus = Enums<"affiliate_status">;

export interface AffiliateFilters {
  q: string;
  status: AffiliateStatus | null;
  page: number;
}

export function parseAffiliateFilters(sp: SearchParams): AffiliateFilters {
  return { q: paramStr(sp, "q"), status: pickEnum(paramStr(sp, "status"), STATUSES), page: paramPage(sp) };
}

export interface AffiliateCommission {
  id: string;
  amount: number;
  rate: number;
  status: Enums<"commission_status">;
  paid_at: string | null;
  created_at: string;
  order: { id: string; order_number: string; total: number; status: Enums<"order_status">; paid_at: string | null } | null;
}

export interface AffiliateRow {
  id: string;
  code: string;
  status: AffiliateStatus;
  commission_rate: number;
  clicks: number;
  notes: string | null;
  created_at: string;
  user: { id: string; email: string; full_name: string | null } | null;
  signups: number;
  orders: number;
  revenue: number;
  commissionTotal: number;
  commissionPaid: number;
  commissionPending: number;
  commissions: AffiliateCommission[];
}

export async function listAffiliates(f: AffiliateFilters): Promise<ListResult<AffiliateRow>> {
  const supabase = await createClient();
  let query = supabase.from("affiliates").select("id, code, status, commission_rate, clicks, notes, created_at, user_id, profiles(id, email, full_name), referral_signups(count), commissions(id, amount, rate, status, paid_at, created_at, orders(id, order_number, total, status, paid_at))", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    const { data: users } = await supabase.from("profiles").select("id").or(`email.ilike.${term},full_name.ilike.${term}`).limit(50);
    const parts = [`code.ilike.${term}`];
    if (users?.length) parts.push(`user_id.in.(${users.map((u) => u.id).join(",")})`);
    query = query.or(parts.join(","));
  }
  if (f.status) query = query.eq("status", f.status);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList(f.page);
    throw new Error(error.message);
  }

  const items: AffiliateRow[] = (data ?? []).map((a) => {
    const commissions: AffiliateCommission[] = (a.commissions ?? [])
      .map((c) => ({ id: c.id, amount: c.amount, rate: c.rate, status: c.status, paid_at: c.paid_at, created_at: c.created_at, order: c.orders ? { id: c.orders.id, order_number: c.orders.order_number, total: c.orders.total, status: c.orders.status, paid_at: c.orders.paid_at } : null }))
      .sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
    const effective = commissions.filter((c) => c.status !== "rejected");
    const paidOrders = commissions.filter((c) => c.order?.status === "paid");
    return {
      id: a.id,
      code: a.code,
      status: a.status,
      commission_rate: a.commission_rate,
      clicks: a.clicks,
      notes: a.notes,
      created_at: a.created_at,
      user: a.profiles ? { id: a.profiles.id, email: a.profiles.email, full_name: a.profiles.full_name } : null,
      signups: a.referral_signups?.[0]?.count ?? 0,
      orders: paidOrders.length,
      revenue: paidOrders.reduce((s, c) => s + (c.order?.total ?? 0), 0),
      commissionTotal: effective.reduce((s, c) => s + c.amount, 0),
      commissionPaid: commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0),
      commissionPending: commissions.filter((c) => c.status === "pending" || c.status === "approved").reduce((s, c) => s + c.amount, 0),
      commissions,
    };
  });
  return { items, total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
}
