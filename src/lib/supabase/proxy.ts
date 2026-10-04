import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/business", "/onboarding", "/generate", "/settings", "/checkout", "/admin", "/payment"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Làm mới session Supabase và bảo vệ route. Chạy trong proxy.ts.
 * Quyền admin được kiểm tra lại ở server (layout + actions) — đây chỉ là lớp chặn sớm.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Không chèn logic giữa createServerClient và getClaims — tránh logout ngẫu nhiên.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = claims ? { id: claims.sub, role: (claims.app_metadata as { role?: string } | undefined)?.role, status: (claims.app_metadata as { status?: string } | undefined)?.status } : null;
  const { pathname, search } = request.nextUrl;

  // Onboarding cho phép khách bắt đầu (lưu localStorage), chỉ cần đăng nhập ở bước lưu.
  const guestAllowed = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (!user && isProtected(pathname) && !guestAllowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (user && user.status === "suspended" && !pathname.startsWith("/suspended") && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/suspended";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = next && next.startsWith("/") && !next.startsWith("//") ? next.split("?")[0] : "/dashboard";
    url.search = next && next.includes("?") ? `?${next.split("?")[1]}` : "";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin") && user.role !== "admin" && user.role !== "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    url.search = "";
    return NextResponse.rewrite(url, { status: 403 });
  }

  return response;
}
