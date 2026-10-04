import "server-only";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Supabase client cho Server Components / Server Actions / Route Handlers.
 * Chạy với quyền của người dùng hiện tại (RLS áp dụng).
 */
export async function createClient() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const userAgent = headerStore.get("user-agent") ?? undefined;
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    // Chuyển tiếp user-agent để Supabase ghi đúng thiết bị cho phiên đăng nhập (trang Bảo mật).
    global: userAgent ? { headers: { "user-agent": userAgent } } : undefined,
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
