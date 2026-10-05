import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExportSignedUrl } from "@/lib/export";
import { logActivity } from "@/lib/data/activity";

/** Tải file export: kiểm tra quyền (RLS), ghi nhận lượt tải, chuyển hướng tới signed URL. */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.redirect(new URL(`/login?next=/dashboard`, _request.url));
  const { data: exp } = await supabase.from("exports").select("*").eq("id", id).maybeSingle();
  if (!exp || exp.status !== "ready" || !exp.file_path) return NextResponse.json({ error: "File chưa sẵn sàng hoặc không tồn tại" }, { status: 404 });
  const url = await getExportSignedUrl(exp.file_path);
  await supabase.from("downloads").insert({ user_id: userData.user.id, business_id: exp.business_id, export_id: exp.id, file_name: exp.file_path.split("/").pop() ?? null });
  await logActivity({ userId: userData.user.id, businessId: exp.business_id, action: "export.downloaded", entityType: "export", entityId: exp.id, title: `Tải ${exp.format.toUpperCase()}: ${exp.title}` });
  return NextResponse.redirect(url);
}
