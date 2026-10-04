"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfileAction, isAdminRole } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { advanceJob, createGenerationJob, GenerationError, retryJob } from "@/lib/ai/jobs";
import type { StageKey } from "@/lib/ai/types";
import { fail, ok, type ActionResult, type GenerationJob } from "@/types";

async function assertJobAccess(jobId: string) {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: job } = await supabase.from("generation_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) throw new GenerationError("Không tìm thấy phiên tạo nội dung", "not_found");
  if (job.user_id !== profile.id && !isAdminRole(profile.role)) throw new GenerationError("Không có quyền", "forbidden");
  return { profile, job };
}

/** Xử lý một stage tiếp theo. Client gọi lặp lại. */
export async function advanceGenerationAction(jobId: string): Promise<ActionResult<GenerationJob>> {
  try {
    await assertJobAccess(jobId);
    const job = await advanceJob(jobId);
    return ok(job);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi xử lý", e instanceof GenerationError ? e.code : undefined);
  }
}

export async function retryGenerationAction(jobId: string): Promise<ActionResult<GenerationJob>> {
  try {
    await assertJobAccess(jobId);
    const job = await retryJob(jobId);
    return ok(job);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi thử lại", e instanceof GenerationError ? e.code : undefined);
  }
}

/** Khởi chạy job tạo toàn bộ kit cho business chưa có nội dung (ví dụ khi trước đó hết credits). */
export async function startFullGenerationAction(businessId: string): Promise<ActionResult<GenerationJob>> {
  try {
    const profile = await requireProfileAction();
    const supabase = await createClient();
    const { data: business } = await supabase.from("businesses").select("id, user_id, status").eq("id", businessId).maybeSingle();
    if (!business || (business.user_id !== profile.id && !isAdminRole(profile.role))) return fail("Không tìm thấy business", "not_found");
    const job = await createGenerationJob({ businessId, userId: profile.id, type: "full" });
    return ok(job);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Không khởi chạy được", e instanceof GenerationError ? e.code : undefined);
  }
}

/** Tạo lại một mục (stage) của business. */
export async function regenerateSectionAction(businessId: string, stage: StageKey): Promise<ActionResult<GenerationJob>> {
  try {
    const profile = await requireProfileAction();
    const supabase = await createClient();
    const { data: business } = await supabase.from("businesses").select("id, user_id").eq("id", businessId).maybeSingle();
    if (!business || (business.user_id !== profile.id && !isAdminRole(profile.role))) return fail("Không tìm thấy business", "not_found");
    const ctx = await getAccessContext(businessId);
    const job = await createGenerationJob({ businessId, userId: profile.id, type: stage, freeRegeneration: can(ctx, "generation.regenerate_free"), isFreePlan: ctx.plan === "free" });
    return ok(job);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Không khởi chạy được", e instanceof GenerationError ? e.code : undefined);
  }
}

/** Lấy job mới nhất của business (để hiển thị tiến trình). */
export async function getLatestJobAction(businessId: string): Promise<ActionResult<GenerationJob | null>> {
  try {
    await requireProfileAction();
    const supabase = await createClient();
    const { data } = await supabase.from("generation_jobs").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return ok(data ?? null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi");
  }
}
