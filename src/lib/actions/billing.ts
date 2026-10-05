"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthError, requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { createOrderForUser, findActiveProduct, isUuid } from "@/lib/payments/orders";
import { fail, ok, type ActionResult, type Subscription } from "@/types";

const PRO_SLUG = "pro-membership";

function authFail(e: unknown): ActionResult<never> {
  if (e instanceof AuthError) return fail(e.message, e.code);
  return fail(e instanceof Error ? e.message : "Đã xảy ra lỗi, vui lòng thử lại.");
}

async function loadOwnSubscription(subscriptionId: string, userId: string): Promise<Subscription | null> {
  if (!isUuid(subscriptionId)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("subscriptions").select("*").eq("id", subscriptionId).maybeSingle();
  if (!data || data.user_id !== userId) return null;
  return data;
}

/** Huỷ gia hạn: gói vẫn dùng đến hết chu kỳ, sau đó không tự gia hạn. */
export async function cancelSubscriptionRenewalAction(subscriptionId: string): Promise<ActionResult<undefined>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const sub = await loadOwnSubscription(subscriptionId, profile.id);
  if (!sub) return fail("Không tìm thấy gói đăng ký", "not_found");
  if (sub.status !== "active") return fail("Gói này không còn hoạt động.", "invalid_state");
  if (sub.cancel_at_period_end) return ok(undefined, "Gói đã được huỷ gia hạn trước đó");
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() }).eq("id", sub.id);
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, action: "subscription.cancel_renewal", entityType: "subscription", entityId: sub.id, title: "Huỷ gia hạn Pro Membership" });
  revalidatePath("/dashboard/billing");
  return ok(undefined, "Đã huỷ gia hạn. Gói vẫn hoạt động đến hết chu kỳ hiện tại.");
}

/** Bật lại gia hạn cho gói đang hoạt động đã huỷ gia hạn. */
export async function resumeSubscriptionRenewalAction(subscriptionId: string): Promise<ActionResult<undefined>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  const sub = await loadOwnSubscription(subscriptionId, profile.id);
  if (!sub) return fail("Không tìm thấy gói đăng ký", "not_found");
  if (sub.status !== "active" || new Date(sub.current_period_end).getTime() < Date.now()) return fail("Gói đã hết hạn — hãy gia hạn ngay để tiếp tục sử dụng.", "invalid_state");
  if (!sub.cancel_at_period_end) return ok(undefined, "Gói đang được gia hạn tự động");
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").update({ cancel_at_period_end: false, canceled_at: null }).eq("id", sub.id);
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, action: "subscription.resume_renewal", entityType: "subscription", entityId: sub.id, title: "Bật lại gia hạn Pro Membership" });
  revalidatePath("/dashboard/billing");
  return ok(undefined, "Đã bật lại gia hạn tự động");
}

/** Gia hạn ngay: tạo đơn mới cho Pro Membership và chuyển tới thanh toán. */
export async function renewSubscriptionNowAction(subscriptionId?: string | null): Promise<ActionResult<{ redirectTo: string }>> {
  let profile;
  try {
    profile = await requireProfileAction();
  } catch (e) {
    return authFail(e);
  }
  if (subscriptionId) {
    const sub = await loadOwnSubscription(subscriptionId, profile.id);
    if (!sub) return fail("Không tìm thấy gói đăng ký", "not_found");
  }
  const product = await findActiveProduct(PRO_SLUG);
  if (!product) return fail("Gói Pro Membership hiện không khả dụng.", "not_found");
  const res = await createOrderForUser(profile, { product, businessId: null, acceptTerms: true, allowRenewal: true });
  if (!res.ok) return res;
  revalidatePath("/dashboard/purchases");
  return ok({ redirectTo: res.data.redirectTo }, "Đã tạo đơn gia hạn");
}
