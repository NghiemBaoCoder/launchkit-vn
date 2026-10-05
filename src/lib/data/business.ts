import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AssetCategory, Business, BusinessAsset, BusinessType, Industry } from "@/types";

export type BusinessWithRefs = Business & { business_types: Pick<BusinessType, "id" | "slug" | "name" | "icon"> | null; industries: Pick<Industry, "id" | "slug" | "name" | "icon"> | null };

/** Business mà user hiện tại được phép xem (RLS: chủ sở hữu hoặc admin). 404 nếu không có. */
export const getBusinessOrNotFound = cache(async (businessId: string): Promise<BusinessWithRefs> => {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("*, business_types(id, slug, name, icon), industries(id, slug, name, icon)").eq("id", businessId).maybeSingle();
  if (!data) notFound();
  return data as BusinessWithRefs;
});

export const getBusinessAssets = cache(async (businessId: string, category?: AssetCategory): Promise<BusinessAsset[]> => {
  const supabase = await createClient();
  let q = supabase.from("business_assets").select("*").eq("business_id", businessId).order("created_at");
  if (category) q = q.eq("category", category);
  const { data } = await q;
  return data ?? [];
});

export function assetByKey(assets: BusinessAsset[], key: string): BusinessAsset | undefined {
  return assets.find((a) => a.key === key);
}

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  weight: number;
}

/** Tính mức độ hoàn thiện business từ dữ liệu thực. */
export const getBusinessCompletion = cache(async (businessId: string): Promise<{ percent: number; items: CompletionItem[] }> => {
  const supabase = await createClient();
  const [{ data: assets }, { count: services }, { count: packages }, { count: content }, { data: site }, { count: docs }, { data: checklists }, { data: business }, { count: finance }, { count: exportsCount }] = await Promise.all([
    supabase.from("business_assets").select("category").eq("business_id", businessId),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("pricing_packages").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("content_items").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("website_sites").select("is_published").eq("business_id", businessId).maybeSingle(),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("checklist_items").select("done").eq("business_id", businessId),
    supabase.from("businesses").select("logo_url, contact").eq("id", businessId).maybeSingle(),
    supabase.from("finance_calculations").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("exports").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "ready"),
  ]);
  const cats = new Set((assets ?? []).map((a) => a.category));
  const contact = (business?.contact as Record<string, string> | null) ?? {};
  const doneItems = (checklists ?? []).filter((c) => c.done).length;
  const items: CompletionItem[] = [
    { key: "brand", label: "Thương hiệu đã tạo", done: cats.has("brand"), href: "brand", weight: 15 },
    { key: "services", label: "Có ít nhất 1 dịch vụ", done: (services ?? 0) > 0, href: "services", weight: 10 },
    { key: "pricing", label: "Bảng giá 3 gói", done: (packages ?? 0) >= 3, href: "pricing", weight: 10 },
    { key: "sales", label: "Kịch bản bán hàng", done: cats.has("sales"), href: "sales", weight: 10 },
    { key: "marketing", label: "Kế hoạch marketing", done: cats.has("marketing"), href: "marketing", weight: 10 },
    { key: "content", label: "Nội dung đã lên lịch", done: (content ?? 0) > 0, href: "content", weight: 10 },
    { key: "website", label: "Website đã xuất bản", done: !!site?.is_published, href: "website", weight: 10 },
    { key: "finance", label: "Kế hoạch tài chính", done: (finance ?? 0) > 0, href: "finance", weight: 5 },
    { key: "operations", label: "Checklist vận hành (≥ 30% hoàn thành)", done: (checklists?.length ?? 0) > 0 && doneItems / Math.max(1, checklists?.length ?? 1) >= 0.3, href: "operations", weight: 5 },
    { key: "documents", label: "Bộ tài liệu", done: (docs ?? 0) > 0, href: "documents", weight: 5 },
    { key: "contact", label: "Thông tin liên hệ", done: !!(contact.phone || contact.email), href: "settings", weight: 5 },
    { key: "export", label: "Đã xuất Business Kit", done: (exportsCount ?? 0) > 0, href: "downloads", weight: 5 },
  ];
  const total = items.reduce((s, i) => s + i.weight, 0);
  const got = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  return { percent: Math.round((got / total) * 100), items };
});
