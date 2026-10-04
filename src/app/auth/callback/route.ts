import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: string | null, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/**
 * Callback cho OAuth (PKCE code), magic link / xác thực email (token_hash) và
 * đặt lại mật khẩu (type=recovery).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Liên kết không hợp lệ hoặc đã hết hạn.")}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const target = type === "recovery" ? "/reset-password" : next;
      return NextResponse.redirect(`${origin}${target}${type === "signup" || type === "email" ? "?verified=1" : ""}`);
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Liên kết xác thực không hợp lệ hoặc đã hết hạn.")}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
