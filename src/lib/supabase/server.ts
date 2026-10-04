import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Supabase client cho Server Components / Server Actions / Route Handlers.
 * Chạy với quyền của người dùng hiện tại (RLS áp dụng).
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Gọi từ Server Component: không thể set cookie, proxy sẽ refresh session.
        }
      },
    },
  });
}
