import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { DEFAULT_AI_SETTINGS, DEFAULT_SITE_SETTINGS, type AiSettings, type SiteSettings } from "@/lib/data/settings";
import { asRecord } from "./admin-shared";

interface SettingMeta {
  updatedAt: string | null;
  updatedBy: { id: string; email: string; full_name: string | null } | null;
}

async function loadSetting(key: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value, updated_at, updated_by").eq("key", key).maybeSingle();
  let updatedBy: SettingMeta["updatedBy"] = null;
  if (data?.updated_by) {
    const { data: p } = await supabase.from("profiles").select("id, email, full_name").eq("id", data.updated_by).maybeSingle();
    updatedBy = p ?? null;
  }
  return { value: asRecord(data?.value), meta: { updatedAt: data?.updated_at ?? null, updatedBy } satisfies SettingMeta };
}

/** Cài đặt AI (app_settings key 'ai') cho trang admin — merge với mặc định. */
export const getAiSettingsAdminView = cache(async (): Promise<{ settings: AiSettings; meta: SettingMeta; hasAnthropicKey: boolean; envProvider: string }> => {
  const { value, meta } = await loadSetting("ai");
  const v = value as Partial<AiSettings>;
  const settings: AiSettings = {
    ...DEFAULT_AI_SETTINGS,
    ...v,
    credits: { ...DEFAULT_AI_SETTINGS.credits, ...(v.credits ?? {}) },
    free_limits: { ...DEFAULT_AI_SETTINGS.free_limits, ...(v.free_limits ?? {}) },
  };
  const env = serverEnv();
  // Chỉ trả về boolean — không bao giờ lộ giá trị key.
  return { settings, meta, hasAnthropicKey: Boolean(env.anthropicApiKey), envProvider: env.aiProvider };
});

/** Cài đặt site (app_settings key 'site') cho trang super admin. */
export const getSiteSettingsAdminView = cache(async (): Promise<{ settings: SiteSettings; meta: SettingMeta }> => {
  const { value, meta } = await loadSetting("site");
  const v = value as Partial<SiteSettings>;
  const settings: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...v, default_pricing: { ...DEFAULT_SITE_SETTINGS.default_pricing, ...(v.default_pricing ?? {}) } };
  return { settings, meta };
});
