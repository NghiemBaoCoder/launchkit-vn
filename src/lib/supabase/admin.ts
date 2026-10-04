import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env, serverEnv } from "@/lib/env";

let adminClient: SupabaseClient<Database> | undefined;

/**
 * Client dùng service role — BỎ QUA RLS.
 * Chỉ dùng ở server sau khi đã kiểm tra quyền (admin / webhook / job nội bộ).
 * Không bao giờ import vào client component.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const { serviceRoleKey } = serverEnv();
  if (!serviceRoleKey) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!adminClient) {
    adminClient = createSupabaseClient<Database>(env.supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
