import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

export const TEMPLATE_CATEGORIES = ["brand", "pricing", "sales", "marketing", "content", "website", "operations", "documents"] as const;
export type TemplateCategory = Enums<"template_category">;

const ACTIVE = ["active", "inactive"] as const;

/** Tất cả loại hình (kể cả đã tắt) — dùng cho select trong form admin. */
export const getAllBusinessTypes = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("business_types").select("id, name, slug, active").order("sort_order").order("name");
  return data ?? [];
});

/** Tất cả ngành (kể cả đã tắt) — dùng cho select. */
export const getAllIndustries = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("industries").select("id, name, slug, active, business_type_id").order("sort_order").order("name");
  return data ?? [];
});

export interface IndustryFilters {
  q: string;
  businessTypeId: string;
  active: "active" | "inactive" | null;
  page: number;
}

export function parseIndustryFilters(sp: SearchParams): IndustryFilters {
  return { q: paramStr(sp, "q"), businessTypeId: paramStr(sp, "type"), active: pickEnum(paramStr(sp, "active"), ACTIVE), page: paramPage(sp) };
}

export async function listIndustriesAdmin(f: IndustryFilters) {
  const supabase = await createClient();
  let query = supabase.from("industries").select("*, business_types(id, name), businesses(count)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (f.businessTypeId) query = query.eq("business_type_id", f.businessTypeId);
  if (f.active) query = query.eq("active", f.active === "active");
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("sort_order").order("name").range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}

export interface BusinessTypeFilters {
  q: string;
  active: "active" | "inactive" | null;
  page: number;
}

export function parseBusinessTypeFilters(sp: SearchParams): BusinessTypeFilters {
  return { q: paramStr(sp, "q"), active: pickEnum(paramStr(sp, "active"), ACTIVE), page: paramPage(sp) };
}

export async function listBusinessTypesAdmin(f: BusinessTypeFilters) {
  const supabase = await createClient();
  let query = supabase.from("business_types").select("*, businesses(count), industries(count)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (f.active) query = query.eq("active", f.active === "active");
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("sort_order").order("name").range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}

export interface TemplateFilters {
  q: string;
  category: TemplateCategory | null;
  active: "active" | "inactive" | null;
  page: number;
}

export function parseTemplateFilters(sp: SearchParams): TemplateFilters {
  return { q: paramStr(sp, "q"), category: pickEnum(paramStr(sp, "category"), TEMPLATE_CATEGORIES), active: pickEnum(paramStr(sp, "active"), ACTIVE), page: paramPage(sp) };
}

export async function listTemplatesAdmin(f: TemplateFilters) {
  const supabase = await createClient();
  let query = supabase.from("templates").select("*, business_types(id, name), industries(id, name)", { count: "exact" });
  if (f.q) query = query.ilike("name", likeTerm(f.q));
  if (f.category) query = query.eq("category", f.category);
  if (f.active) query = query.eq("active", f.active === "active");
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("category").order("name").range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}
