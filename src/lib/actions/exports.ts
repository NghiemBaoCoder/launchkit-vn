"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { createExport, runExport } from "@/lib/export";
import { EXPORTABLE_SECTIONS } from "@/lib/export/build";
import { fail, ok, type ActionResult, type ExportRow } from "@/types";

const schema = z.object({
  businessId: z.string().uuid(),
  kind: z.enum(["full_kit", "section", "document"]),
  format: z.enum(["pdf", "csv", "txt", "md", "zip"]),
  items: z.array(z.string()).max(20).optional(),
});

/** Tạo và chạy export ngay (mock nhanh). Kiểm tra quyền theo entitlement. */
export async function createExportAction(input: unknown): Promise<ActionResult<ExportRow>> {
  const profile = await requireProfileAction();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Yêu cầu xuất không hợp lệ", "validation");
  const { businessId, kind, format, items } = parsed.data;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").eq("id", businessId).maybeSingle();
  if (!business) return fail("Không tìm thấy business", "not_found");
  const ctx = await getAccessContext(businessId);
  if (!can(ctx, "exports.basic")) return fail("Xuất file thuộc gói Business Kit. Hãy mở khoá để tải PDF/CSV/Markdown.", "forbidden");
  if ((format === "zip" || (kind === "full_kit" && format === "pdf")) && !can(ctx, "exports.premium")) return fail("Trọn bộ ZIP và PDF toàn bộ kit thuộc gói Business Kit Pro.", "forbidden");
  if (kind === "section" && (!items?.length || items.some((s) => !(EXPORTABLE_SECTIONS as readonly string[]).includes(s)))) return fail("Chọn ít nhất một mục hợp lệ", "validation");
  if (kind === "document" && items?.length !== 1) return fail("Chọn một tài liệu", "validation");
  try {
    const row = await createExport({ businessId, userId: profile.id, kind, format, items });
    const done = await runExport(row.id);
    revalidatePath(`/business/${businessId}/downloads`);
    revalidatePath("/dashboard");
    if (done.status === "failed") return fail(done.error ?? "Xuất file thất bại");
    return ok(done, "File đã sẵn sàng để tải");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Xuất file thất bại");
  }
}

/** Chạy lại export thất bại hoặc tạo bản mới với cùng cấu hình. */
export async function regenerateExportAction(exportId: string): Promise<ActionResult<ExportRow>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: exp } = await supabase.from("exports").select("*").eq("id", exportId).maybeSingle();
  if (!exp || exp.user_id !== profile.id) return fail("Không tìm thấy export", "not_found");
  return createExportAction({ businessId: exp.business_id, kind: exp.kind, format: exp.format, items: (exp.items as string[]) ?? [] });
}

export async function deleteExportAction(exportId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: exp } = await supabase.from("exports").select("*").eq("id", exportId).maybeSingle();
  if (!exp || exp.user_id !== profile.id) return fail("Không tìm thấy export", "not_found");
  if (exp.file_path) await supabase.storage.from("exports").remove([exp.file_path]);
  const { error } = await supabase.from("exports").delete().eq("id", exportId);
  if (error) return fail(error.message);
  revalidatePath(`/business/${exp.business_id}/downloads`);
  return ok(undefined, "Đã xoá file");
}
