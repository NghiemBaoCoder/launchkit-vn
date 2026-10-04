import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdminRole } from "@/lib/auth";
import { derivePlan, GUEST_CONTEXT, type AccessContext, type EntitlementKey } from "./policy";

/**
 * Lấy ngữ cảnh phân quyền của user hiện tại cho một business (tuỳ chọn).
 * Entitlement hết hạn (expires_at < now) bị bỏ qua.
 */
export const getAccessContext = cache(async (businessId?: string | null): Promise<AccessContext> => {
  const profile = await getCurrentProfile();
  if (!profile) return GUEST_CONTEXT;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("entitlements")
    .select("key, business_id, expires_at")
    .eq("user_id", profile.id);

  const now = Date.now();
  const account: EntitlementKey[] = [];
  const business: EntitlementKey[] = [];
  for (const r of rows ?? []) {
    if (r.expires_at && new Date(r.expires_at).getTime() < now) continue;
    const key = r.key as EntitlementKey;
    if (r.business_id === null) account.push(key);
    else if (businessId && r.business_id === businessId) business.push(key);
  }

  const isAdmin = isAdminRole(profile.role) && profile.status === "active";
  return {
    userId: profile.id,
    role: profile.role,
    isAdmin,
    plan: derivePlan(account, business, isAdmin),
    credits: profile.credits,
    accountEntitlements: account,
    businessEntitlements: business,
    businessId: businessId ?? null,
  };
});
