import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

let publicClient: SupabaseClient<Database> | undefined;

/**
 * Client anon KHÔNG đọc cookie — chỉ dùng cho dữ liệu công khai (catalog, cài đặt site, ví dụ).
 * Nhờ không chạm vào cookies()/headers(), các trang public có thể prerender / ISR thay vì
 * render động trên mỗi request → TTFB nhanh hơn nhiều trên Vercel.
 */
export function createPublicClient(): SupabaseClient<Database> {
  if (!publicClient) {
    publicClient = createSupabaseClient<Database>(env.supabaseUrl || "http://127.0.0.1:54321", env.supabaseAnonKey || "anon", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return publicClient;
}
