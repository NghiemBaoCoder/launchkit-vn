"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { advanceJob, retryJob } from "@/lib/ai/jobs";
import type { StageState } from "@/lib/ai/types";
import { logAudit } from "@/lib/data/activity";
import { fail, ok, type ActionResult, type JobStatus } from "@/types";
import { adminActionError } from "./admin-helpers";

const MAX_ITERATIONS = 15;

export interface RetryResult {
  status: JobStatus;
  iterations: number;
  completedStages: number;
  totalStages: number;
  error: string | null;
}

/**
 * Thử lại job thất bại: đặt lại các stage lỗi rồi chạy `advanceJob` lặp (tối đa 15 lần)
 * cho tới khi hoàn tất hoặc thất bại. Chạy đồng bộ trong một server action.
 */
export async function retryGenerationJobAction(jobId: string): Promise<ActionResult<RetryResult>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(jobId).success) return fail("ID không hợp lệ", "validation");

    const supabase = await createClient();
    const { data: existing } = await supabase.from("generation_jobs").select("id, status, business_id, user_id, attempts").eq("id", jobId).maybeSingle();
    if (!existing) return fail("Không tìm thấy job", "not_found");
    if (existing.status !== "failed") return fail("Chỉ thử lại được job đã thất bại.", "conflict");

    let job = await retryJob(jobId);
    let iterations = 0;
    while (iterations < MAX_ITERATIONS && job.status !== "completed" && job.status !== "failed") {
      job = await advanceJob(jobId);
      iterations++;
    }

    const stages = (job.stages as unknown as StageState[]) ?? [];
    const result: RetryResult = {
      status: job.status,
      iterations,
      completedStages: stages.filter((s) => s.status === "completed").length,
      totalStages: stages.length,
      error: job.error ?? null,
    };

    await logAudit({ actorId: admin.id, action: "admin.generation.retry", targetType: "generation_job", targetId: jobId, before: { status: "failed", attempts: existing.attempts }, after: { status: job.status, attempts: job.attempts }, metadata: { ...result, business_id: existing.business_id, user_id: existing.user_id } });
    revalidatePath("/admin/generations");
    revalidatePath(`/admin/businesses/${existing.business_id}`);
    revalidatePath("/admin");

    const message =
      job.status === "completed"
        ? `Đã tạo lại thành công (${result.completedStages}/${result.totalStages} stage, ${iterations} lượt).`
        : job.status === "failed"
          ? `Job vẫn thất bại: ${job.error ?? "không rõ lỗi"}.`
          : `Đã chạy ${iterations} lượt, job vẫn đang xử lý (${result.completedStages}/${result.totalStages}). Khách có thể tiếp tục ở trang generate.`;
    return ok(result, message);
  } catch (e) {
    return adminActionError(e);
  }
}
