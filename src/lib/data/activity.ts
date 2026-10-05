import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JsonValue } from "@/types";

/** Ghi activity log của người dùng (hiển thị ở dashboard). */
export async function logActivity(p: { userId: string | null; businessId?: string | null; action: string; entityType?: string; entityId?: string; title?: string; metadata?: Record<string, unknown> }) {
  const admin = createAdminClient();
  await admin.from("activity_logs").insert({ user_id: p.userId, business_id: p.businessId ?? null, action: p.action, entity_type: p.entityType ?? null, entity_id: p.entityId ?? null, title: p.title ?? null, metadata: (p.metadata ?? {}) as JsonValue });
}

/** Ghi audit log cho thao tác admin. */
export async function logAudit(p: { actorId: string; action: string; targetType?: string; targetId?: string; before?: unknown; after?: unknown; metadata?: Record<string, unknown> }) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({ actor_id: p.actorId, action: p.action, target_type: p.targetType ?? null, target_id: p.targetId ?? null, before_data: (p.before ?? null) as JsonValue, after_data: (p.after ?? null) as JsonValue, metadata: (p.metadata ?? {}) as JsonValue });
}
