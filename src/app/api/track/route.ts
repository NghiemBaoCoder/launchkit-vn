import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JsonValue } from "@/types";

const ALLOWED_EVENTS = new Set(["landing_view", "generator_start", "generator_complete", "workspace_preview", "checkout_view", "pricing_view", "example_view", "share_view", "site_view"]);

const schema = z.object({
  event: z.string().min(1).max(60),
  anon_id: z.string().max(80).optional(),
  path: z.string().max(300).optional(),
  source: z.string().max(120).nullable().optional(),
  ref: z.string().max(40).nullable().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

/** Ghi sự kiện phân tích (public, chỉ insert). */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success || !ALLOWED_EVENTS.has(parsed.data.event)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;
  const { event, anon_id, path, source, ref, properties } = parsed.data;

  await supabase.from("analytics_events").insert({ user_id: userId, anon_id: anon_id ?? null, event, path: path ?? null, source: source ?? null, properties: (properties ?? {}) as JsonValue });

  // Ghi nhận click giới thiệu + set cookie 30 ngày
  const res = NextResponse.json({ ok: true });
  if (ref && event === "landing_view") {
    const admin = createAdminClient();
    const { data: aff } = await admin.from("affiliates").select("id, status").eq("code", ref.toUpperCase()).maybeSingle();
    if (aff && aff.status === "approved") {
      const ua = request.headers.get("user-agent") ?? "";
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
      const ipHash = ip ? Buffer.from(ip).toString("base64url").slice(0, 24) : null;
      await admin.from("referral_clicks").insert({ affiliate_id: aff.id, landing_path: path ?? null, user_agent: ua.slice(0, 200), ip_hash: ipHash });
      const { count } = await admin.from("referral_clicks").select("id", { count: "exact", head: true }).eq("affiliate_id", aff.id);
      await admin.from("affiliates").update({ clicks: count ?? 0 }).eq("id", aff.id);
      res.cookies.set("lk_ref", ref.toUpperCase(), { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
    }
  }
  return res;
}
