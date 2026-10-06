import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export interface SiteSettings {
  site_name: string;
  logo_url: string | null;
  support_email: string;
  default_currency: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  referral_percentage: number;
  free_credits: number;
  purchase_credits: number;
  affiliate_auto_approve: boolean;
  default_pricing: Record<string, number>;
}

export interface AiSettings {
  provider: "mock" | "anthropic";
  model: string;
  credits: { full: number; section: number; document: number; content: number };
  free_limits: { max_businesses: number; max_regenerations_per_day: number };
  timeout_ms: number;
  stage_delay_ms: number;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "LaunchKit VN",
  logo_url: null,
  support_email: "support@launchkit.vn",
  default_currency: "VND",
  maintenance_mode: false,
  registration_enabled: true,
  referral_percentage: 10,
  free_credits: 3,
  purchase_credits: 20,
  affiliate_auto_approve: true,
  default_pricing: { business_kit: 299000, business_kit_pro: 599000, pro_membership: 199000 },
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "mock",
  model: "launchkit-mock-v1",
  credits: { full: 1, section: 1, document: 1, content: 1 },
  free_limits: { max_businesses: 1, max_regenerations_per_day: 3 },
  timeout_ms: 60000,
  stage_delay_ms: 600,
};

/** Cài đặt public của site (đọc được bởi khách). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  // Client public (không cookie) để layout/trang công khai vẫn prerender được.
  const supabase = createPublicClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "site").maybeSingle();
  return { ...DEFAULT_SITE_SETTINGS, ...((data?.value as Partial<SiteSettings>) ?? {}) };
});
