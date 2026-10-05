import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { BusinessType, Industry } from "@/types";

export const getBusinessTypes = cache(async (): Promise<BusinessType[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("business_types").select("*").eq("active", true).order("sort_order");
  return data ?? [];
});

export const getIndustries = cache(async (): Promise<Industry[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("industries").select("*").eq("active", true).order("sort_order");
  return data ?? [];
});

export const getBusinessTypeBySlug = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("business_types").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return data;
});

export const getProducts = cache(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("*").eq("active", true).order("sort_order");
  return data ?? [];
});
