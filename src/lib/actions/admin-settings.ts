"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/data/activity";
import type { AiSettings, SiteSettings } from "@/lib/data/settings";
import { fail, ok, type ActionResult, type JsonValue } from "@/types";
import { adminActionError, zodFieldErrors, zodMessage } from "./admin-helpers";

const aiSchema = z.object({
  provider: z.enum(["mock", "anthropic"]),
  model: z.string().trim().min(1, "Nhập tên model").max(120),
  credits: z.object({
    full: z.number().int().min(0).max(1000),
    section: z.number().int().min(0).max(1000),
    document: z.number().int().min(0).max(1000),
    content: z.number().int().min(0).max(1000),
  }),
  free_limits: z.object({
    max_businesses: z.number().int().min(0).max(100),
    max_regenerations_per_day: z.number().int().min(0).max(1000),
  }),
  timeout_ms: z.number().int().min(1000, "Tối thiểu 1000ms").max(600000, "Tối đa 600000ms"),
  stage_delay_ms: z.number().int().min(0).max(60000),
});

export type AiSettingsInput = z.input<typeof aiSchema>;

/** Lưu cài đặt AI (admin). API key KHÔNG lưu trong DB — chỉ đọc từ biến môi trường. */
export async function updateAiSettingsAction(input: AiSettingsInput): Promise<ActionResult<AiSettings>> {
  try {
    const admin = await requireAdminAction();
    const parsed = aiSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const value: AiSettings = parsed.data;

    const supabase = await createClient();
    const { data: before } = await supabase.from("app_settings").select("value").eq("key", "ai").maybeSingle();
    const { error } = await supabase.from("app_settings").upsert({ key: "ai", value: value as unknown as JsonValue, is_public: false, updated_by: admin.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return fail(error.message);

    await logAudit({ actorId: admin.id, action: "admin.settings.update", targetType: "app_settings", targetId: "ai", before: before?.value ?? null, after: value });
    revalidatePath("/admin/settings/ai");
    return ok(value, "Đã lưu cài đặt AI");
  } catch (e) {
    return adminActionError(e);
  }
}

const siteSchema = z.object({
  site_name: z.string().trim().min(2, "Tên site tối thiểu 2 ký tự").max(80),
  logo_url: z.string().trim().max(500).refine((v) => !v || /^(https?:\/\/|\/)/.test(v), "URL logo phải bắt đầu bằng http(s):// hoặc /"),
  support_email: z.string().trim().email("Email hỗ trợ không hợp lệ").max(120),
  default_currency: z.string().trim().toUpperCase().length(3, "Mã tiền tệ gồm 3 ký tự (VND)"),
  default_pricing: z.object({
    business_kit: z.number().min(0).max(1_000_000_000),
    business_kit_pro: z.number().min(0).max(1_000_000_000),
    pro_membership: z.number().min(0).max(1_000_000_000),
  }),
  maintenance_mode: z.boolean(),
  registration_enabled: z.boolean(),
  referral_percentage: z.number().min(0).max(100),
  free_credits: z.number().int().min(0).max(1000),
  purchase_credits: z.number().int().min(0).max(100000),
  affiliate_auto_approve: z.boolean(),
});

export type SiteSettingsInput = z.input<typeof siteSchema>;

/** Lưu cài đặt site — chỉ super admin. */
export async function updateSiteSettingsAction(input: SiteSettingsInput): Promise<ActionResult<SiteSettings>> {
  try {
    const admin = await requireAdminAction({ superOnly: true });
    const parsed = siteSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const value: SiteSettings = { ...parsed.data, logo_url: parsed.data.logo_url || null };

    const supabase = await createClient();
    const { data: before } = await supabase.from("app_settings").select("value").eq("key", "site").maybeSingle();
    const { error } = await supabase.from("app_settings").upsert({ key: "site", value: value as unknown as JsonValue, is_public: true, updated_by: admin.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return fail(error.message);

    await logAudit({ actorId: admin.id, action: "admin.settings.update", targetType: "app_settings", targetId: "site", before: before?.value ?? null, after: value });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return ok(value, "Đã lưu cài đặt site");
  } catch (e) {
    return adminActionError(e);
  }
}
