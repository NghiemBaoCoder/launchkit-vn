import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JsonValue } from "@/types";
import type { GenerationJob } from "@/types";
import { onboardingAnswersSchema } from "@/lib/onboarding/schema";
import { DEFAULT_AI_SETTINGS, type AiSettings } from "@/lib/data/settings";
import { getAIProvider } from "./index";
import { GENERATION_STAGES, type GenerationContext, type StageKey, type StageState } from "./types";
import { persistStage } from "./persist";
import { createNotification } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import { hashString } from "./mock/rng";

export class GenerationError extends Error {
  constructor(message: string, public code: "insufficient_credits" | "not_found" | "forbidden" | "busy" | "limit" | "invalid" = "invalid") {
    super(message);
  }
}

export async function getAiSettingsAdmin(): Promise<AiSettings> {
  const admin = createAdminClient();
  const { data } = await admin.from("app_settings").select("value").eq("key", "ai").maybeSingle();
  return { ...DEFAULT_AI_SETTINGS, ...((data?.value as Partial<AiSettings>) ?? {}) };
}

/** Xây ngữ cảnh sinh nội dung từ DB. */
export async function buildGenerationContext(businessId: string, seedSalt = ""): Promise<GenerationContext> {
  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("*, business_types(slug, name), industries(slug, name)").eq("id", businessId).single();
  if (!business) throw new GenerationError("Không tìm thấy business", "not_found");
  const { data: answersRow } = await admin.from("business_answers").select("answers").eq("business_id", businessId).maybeSingle();
  const parsed = onboardingAnswersSchema.safeParse(answersRow?.answers ?? {});
  if (!parsed.success) throw new GenerationError("Thông tin onboarding chưa đầy đủ. Vui lòng hoàn thành wizard.", "invalid");

  const { data: templates } = await admin.from("templates").select("category, config, business_type_id, industry_id").eq("active", true);
  const tmpl: GenerationContext["templates"] = {};
  for (const t of templates ?? []) {
    // Ưu tiên template theo ngành > loại hình > chung
    const score = (t.industry_id === business.industry_id ? 2 : 0) + (t.business_type_id === business.business_type_id ? 1 : 0) + (t.industry_id === null && t.business_type_id === null ? 0.5 : 0);
    const prev = (tmpl[t.category] as { __score?: number } | undefined)?.__score ?? -1;
    if (score > prev) tmpl[t.category] = { ...(t.config as Record<string, unknown>), __score: score };
  }

  return {
    businessId,
    businessName: business.name,
    businessType: business.business_types ?? { slug: parsed.data.businessTypeSlug, name: parsed.data.businessTypeSlug },
    industry: business.industries ?? { slug: parsed.data.industrySlug, name: parsed.data.industryCustom || parsed.data.industrySlug },
    answers: parsed.data,
    currency: business.currency,
    seed: hashString(`${businessId}:${seedSalt}`),
    templates: tmpl,
  };
}

export function initialStages(type: string): StageState[] {
  const keys: StageKey[] = type === "full" ? GENERATION_STAGES.map((s) => s.key) : [type as StageKey];
  return keys.map((key) => ({ key, status: "pending" }));
}

/**
 * Tạo job sinh nội dung. Trừ credits (nếu cần) một cách nguyên tử.
 * `freeRegeneration` = true khi user có entitlement `regeneration` hoặc là admin.
 */
export async function createGenerationJob(params: { businessId: string; userId: string; type: "full" | StageKey; freeRegeneration?: boolean; isFreePlan?: boolean }): Promise<GenerationJob> {
  const admin = createAdminClient();
  const settings = await getAiSettingsAdmin();
  const { businessId, userId, type } = params;

  const { data: active } = await admin.from("generation_jobs").select("id").eq("business_id", businessId).in("status", ["pending", "processing"]).limit(1);
  if (active && active.length) throw new GenerationError("Đang có một phiên tạo nội dung chạy cho business này.", "busy");

  let credits = 0;
  if (type === "full") credits = settings.credits.full;
  else if (type === "documents") credits = settings.credits.document;
  else if (type === "content") credits = settings.credits.content;
  else credits = settings.credits.section;
  if (type !== "full" && params.freeRegeneration) credits = 0;

  if (type !== "full" && params.isFreePlan) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await admin.from("generation_jobs").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("type", "full").gte("created_at", since.toISOString());
    if ((count ?? 0) >= settings.free_limits.max_regenerations_per_day) {
      throw new GenerationError(`Gói miễn phí được tạo lại tối đa ${settings.free_limits.max_regenerations_per_day} lần/ngày. Nâng cấp để không giới hạn.`, "limit");
    }
  }

  if (credits > 0) {
    const { data: balance, error } = await admin.rpc("adjust_credits", { p_user_id: userId, p_amount: -credits, p_reason: type === "full" ? "Tạo Business Kit" : `Tạo lại mục ${type}`, p_ref_type: "generation", p_ref_id: businessId, p_actor: userId });
    if (error) {
      if (error.message.includes("insufficient")) throw new GenerationError("Bạn không đủ credits. Mua thêm hoặc nâng cấp gói để tiếp tục.", "insufficient_credits");
      throw error;
    }
    if (typeof balance === "number" && balance <= 1) {
      await createNotification(userId, { type: "credits_low", title: "Credits sắp hết", body: `Bạn còn ${balance} credit. Mua Business Kit hoặc nâng cấp để nhận thêm credits.`, href: "/pricing" });
    }
  }

  const { data: job, error } = await admin
    .from("generation_jobs")
    .insert({ business_id: businessId, user_id: userId, type, provider: settings.provider, model: settings.model, status: "pending", stages: initialStages(type) as unknown as JsonValue, credits_used: credits })
    .select("*")
    .single();
  if (error) throw error;
  if (type === "full") await admin.from("businesses").update({ status: "generating" }).eq("id", businessId);
  return job;
}

/**
 * Xử lý đúng MỘT stage đang chờ. Client gọi lặp lại cho đến khi completed/failed.
 * Thiết kế này an toàn với serverless (mỗi request ngắn) và có thể resume.
 */
export async function advanceJob(jobId: string): Promise<GenerationJob> {
  const admin = createAdminClient();
  const { data: job } = await admin.from("generation_jobs").select("*").eq("id", jobId).single();
  if (!job) throw new GenerationError("Không tìm thấy job", "not_found");
  if (job.status === "completed" || job.status === "failed") return job;

  const stages = (job.stages as unknown as StageState[]) ?? [];
  const next = stages.find((s) => s.status === "pending" || s.status === "processing");
  const settings = await getAiSettingsAdmin();

  if (!next) {
    return finalizeJob(jobId, job, stages);
  }

  // Đánh dấu bắt đầu
  const startedAt = job.started_at ?? new Date().toISOString();
  next.status = "processing";
  next.started_at = new Date().toISOString();
  await admin.from("generation_jobs").update({ status: "processing", started_at: startedAt, current_stage: next.key, stages: stages as unknown as JsonValue }).eq("id", jobId);

  try {
    const ctx = await buildGenerationContext(job.business_id, `${job.id}:${job.attempts}`);
    const provider = getAIProvider(settings);
    const output = await Promise.race([
      provider.generateStage(next.key, ctx),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Hết thời gian chờ provider")), settings.timeout_ms)),
    ]);
    await persistStage(admin, { stage: next.key, output, businessId: job.business_id, actorId: job.user_id, source: job.type === "full" ? "generate" : "regenerate" });
    next.status = "completed";
    next.completed_at = new Date().toISOString();
    next.error = null;
  } catch (e) {
    next.status = "failed";
    next.error = e instanceof Error ? e.message : String(e);
    const { data: failed } = await admin.from("generation_jobs").update({ status: "failed", error: next.error, stages: stages as unknown as JsonValue, completed_at: new Date().toISOString() }).eq("id", jobId).select("*").single();
    await createNotification(job.user_id, { type: "generation_failed", title: "Tạo nội dung thất bại", body: `Mục "${next.key}" gặp lỗi. Bạn có thể thử lại.`, href: `/generate/${job.business_id}` });
    return failed!;
  }

  const remaining = stages.some((s) => s.status === "pending");
  if (remaining) {
    const { data: updated } = await admin.from("generation_jobs").update({ stages: stages as unknown as JsonValue, current_stage: next.key }).eq("id", jobId).select("*").single();
    return updated!;
  }
  return finalizeJob(jobId, { ...job, started_at: startedAt }, stages);
}

async function finalizeJob(jobId: string, job: GenerationJob, stages: StageState[]): Promise<GenerationJob> {
  const admin = createAdminClient();
  const completedAt = new Date();
  const duration = job.started_at ? completedAt.getTime() - new Date(job.started_at).getTime() : null;
  const { data: done } = await admin
    .from("generation_jobs")
    .update({ status: "completed", stages: stages as unknown as JsonValue, completed_at: completedAt.toISOString(), duration_ms: duration, current_stage: null, error: null })
    .eq("id", jobId)
    .select("*")
    .single();
  await admin.from("businesses").update({ status: "ready", generated_at: completedAt.toISOString() }).eq("id", job.business_id);
  const { data: biz } = await admin.from("businesses").select("name").eq("id", job.business_id).single();
  await createNotification(job.user_id, {
    type: job.type === "full" ? "business_generated" : "section_regenerated",
    title: job.type === "full" ? "Business Kit đã sẵn sàng 🎉" : "Đã tạo lại nội dung",
    body: job.type === "full" ? `${biz?.name ?? "Business"} đã được tạo xong. Vào workspace để xem.` : `Mục "${job.type}" của ${biz?.name ?? "business"} đã được làm mới.`,
    href: `/business/${job.business_id}/overview`,
  });
  await logActivity({ userId: job.user_id, businessId: job.business_id, action: job.type === "full" ? "generation.completed" : "generation.section_completed", entityType: "generation_job", entityId: jobId, title: job.type === "full" ? "Tạo Business Kit hoàn tất" : `Tạo lại mục ${job.type}` });
  await admin.from("analytics_events").insert({ user_id: job.user_id, event: "generation_done", properties: { business_id: job.business_id, type: job.type } as JsonValue });
  return done!;
}

/** Thử lại job thất bại: đặt lại các stage failed về pending. */
export async function retryJob(jobId: string): Promise<GenerationJob> {
  const admin = createAdminClient();
  const { data: job } = await admin.from("generation_jobs").select("*").eq("id", jobId).single();
  if (!job) throw new GenerationError("Không tìm thấy job", "not_found");
  if (job.status !== "failed") return job;
  const stages = ((job.stages as unknown as StageState[]) ?? []).map((s) => (s.status === "failed" || s.status === "processing" ? { ...s, status: "pending" as const, error: null } : s));
  const { data: updated, error } = await admin.from("generation_jobs").update({ status: "pending", error: null, stages: stages as unknown as JsonValue, attempts: job.attempts + 1, completed_at: null }).eq("id", jobId).select("*").single();
  if (error) throw error;
  if (job.type === "full") await admin.from("businesses").update({ status: "generating" }).eq("id", job.business_id);
  return updated;
}
