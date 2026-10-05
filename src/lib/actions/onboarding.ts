"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfileAction, getCurrentProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { onboardingAnswersSchema, type OnboardingDraft } from "@/lib/onboarding/schema";
import { createGenerationJob, GenerationError } from "@/lib/ai/jobs";
import { logActivity } from "@/lib/data/activity";
import { slugify, randomToken } from "@/lib/utils";
import { fail, ok, type ActionResult, type JsonValue } from "@/types";

/** Lưu nháp onboarding vào profile (chỉ khi đã đăng nhập). */
export async function saveOnboardingDraftAction(draft: OnboardingDraft): Promise<ActionResult<undefined>> {
  const profile = await getCurrentProfile();
  if (!profile) return ok(undefined); // khách: lưu localStorage ở client
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ onboarding_draft: { ...draft, updatedAt: new Date().toISOString() } as JsonValue }).eq("id", profile.id);
  if (error) return fail(error.message);
  return ok(undefined);
}

export async function clearOnboardingDraftAction(): Promise<ActionResult<undefined>> {
  const profile = await getCurrentProfile();
  if (!profile) return ok(undefined);
  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_draft: null }).eq("id", profile.id);
  return ok(undefined);
}

async function uniqueBusinessSlug(base: string) {
  const admin = createAdminClient();
  let slug = base || `business-${randomToken(6).toLowerCase()}`;
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${randomToken(4).toLowerCase()}`;
  }
  return `${base}-${randomToken(8).toLowerCase()}`;
}

/** Tạo business từ câu trả lời onboarding và khởi chạy job sinh nội dung. */
export async function createBusinessFromOnboardingAction(input: unknown): Promise<ActionResult<{ businessId: string; jobId: string }>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Bạn cần đăng nhập", "unauthenticated");
  }
  const parsed = onboardingAnswersSchema.safeParse(input);
  if (!parsed.success) return fail("Thông tin chưa đầy đủ. Vui lòng kiểm tra lại các bước.", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const answers = parsed.data;

  const supabase = await createClient();
  const ctx = await getAccessContext();

  // Giới hạn số business cho gói miễn phí
  if (!can(ctx, "business.multiple")) {
    const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived");
    if ((count ?? 0) >= 1) return fail("Gói miễn phí chỉ tạo được 1 business. Nâng cấp Pro Membership để tạo nhiều business.", "limit");
  }

  const [{ data: bt }, { data: ind }] = await Promise.all([
    supabase.from("business_types").select("id").eq("slug", answers.businessTypeSlug).maybeSingle(),
    supabase.from("industries").select("id").eq("slug", answers.industrySlug).maybeSingle(),
  ]);
  if (!bt) return fail("Loại hình kinh doanh không hợp lệ", "validation");

  const slug = await uniqueBusinessSlug(slugify(answers.businessName));
  const { data: business, error } = await supabase
    .from("businesses")
    .insert({ user_id: profile.id, name: answers.businessName, slug, business_type_id: bt.id, industry_id: ind?.id ?? null, status: "draft", location: answers.location || null, onboarding_step: 12, onboarding_completed: true, contact: {} })
    .select("id")
    .single();
  if (error || !business) return fail(error?.message ?? "Không tạo được business");

  const { error: ansErr } = await supabase.from("business_answers").insert({ business_id: business.id, answers: answers as unknown as JsonValue });
  if (ansErr) return fail(ansErr.message);

  await logActivity({ userId: profile.id, businessId: business.id, action: "business.created", entityType: "business", entityId: business.id, title: `Tạo business "${answers.businessName}"` });
  await supabase.from("analytics_events").insert({ user_id: profile.id, event: "generator_start", properties: { business_id: business.id, business_type: answers.businessTypeSlug, industry: answers.industrySlug } as JsonValue });
  await supabase.from("profiles").update({ onboarding_draft: null }).eq("id", profile.id);

  try {
    const job = await createGenerationJob({ businessId: business.id, userId: profile.id, type: "full" });
    return ok({ businessId: business.id, jobId: job.id });
  } catch (e) {
    if (e instanceof GenerationError) {
      // Business vẫn được lưu ở trạng thái draft; người dùng có thể chạy lại sau khi có credits.
      return ok({ businessId: business.id, jobId: "" }, e.message);
    }
    return fail(e instanceof Error ? e.message : "Không khởi chạy được tạo nội dung");
  }
}
