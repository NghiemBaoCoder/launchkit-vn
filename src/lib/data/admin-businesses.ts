import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BusinessStatus } from "@/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

const STATUSES = ["draft", "generating", "ready", "archived"] as const;

export interface BusinessFilters {
  q: string;
  status: BusinessStatus | null;
  page: number;
}

export function parseBusinessFilters(sp: SearchParams): BusinessFilters {
  return { q: paramStr(sp, "q"), status: pickEnum(paramStr(sp, "status"), STATUSES), page: paramPage(sp) };
}

export async function listBusinesses(f: BusinessFilters) {
  const supabase = await createClient();
  let query = supabase.from("businesses").select("id, name, slug, status, created_at, generated_at, updated_at, user_id, profiles(email, full_name), industries(name), business_types(name)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
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

export const getBusinessDetail = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*, profiles(id, email, full_name, status), industries(id, name, slug), business_types(id, name, slug)").eq("id", id).maybeSingle();
  if (!business) return null;

  const [answers, assets, orders, entitlements, jobs, counts] = await Promise.all([
    supabase.from("business_answers").select("answers, updated_at").eq("business_id", id).maybeSingle(),
    supabase.from("business_assets").select("id, category, key, title, version, is_premium, updated_at").eq("business_id", id).order("category").order("key"),
    supabase.from("orders").select("id, order_number, status, total, created_at, paid_at, products(name)").eq("business_id", id).order("created_at", { ascending: false }),
    supabase.from("entitlements").select("id, key, source, expires_at, created_at, order_id, products(name)").eq("business_id", id).order("created_at", { ascending: false }),
    supabase.from("generation_jobs").select("*").eq("business_id", id).order("created_at", { ascending: false }).limit(30),
    Promise.all([
      supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("content_items").select("id", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("marketing_plan_items").select("id", { count: "exact", head: true }).eq("business_id", id),
      supabase.from("website_sites").select("is_published, slug").eq("business_id", id).maybeSingle(),
    ]),
  ]);

  return {
    business,
    answers: answers.data?.answers ?? null,
    answersUpdatedAt: answers.data?.updated_at ?? null,
    assets: assets.data ?? [],
    orders: orders.data ?? [],
    entitlements: entitlements.data ?? [],
    jobs: jobs.data ?? [],
    counts: {
      services: counts[0].count ?? 0,
      content: counts[1].count ?? 0,
      documents: counts[2].count ?? 0,
      marketing: counts[3].count ?? 0,
      website: counts[4].data ?? null,
    },
  };
});

export type BusinessDetail = NonNullable<Awaited<ReturnType<typeof getBusinessDetail>>>;
