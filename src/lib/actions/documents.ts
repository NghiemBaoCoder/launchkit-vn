"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { logActivity } from "@/lib/data/activity";
import { buildGenerationContext } from "@/lib/ai/jobs";
import { genDocuments } from "@/lib/ai/mock/stage-ops";
import { documentSchema } from "@/lib/workspace/schemas";
import { fail, ok, type ActionResult, type DocumentRow, type JsonValue } from "@/types";

const typeSchema = z.enum(["quotation", "proposal", "service_agreement", "client_brief", "invoice", "intake_form"]);

async function assertDocAccess(businessId: string, type: string) {
  const ctx = await getAccessContext(businessId);
  if (!can(ctx, "documents.full") && !(FREE_PREVIEW.documentsVisible as readonly string[]).includes(type)) throw new Error("Loại tài liệu này thuộc gói Business Kit. Hãy mở khoá để sử dụng.");
}

/** Tạo tài liệu mới từ template theo ngữ cảnh business (không tốn credits). */
export async function createDocumentAction(businessId: string, type: string): Promise<ActionResult<DocumentRow>> {
  const profile = await requireProfileAction();
  const t = typeSchema.safeParse(type);
  if (!t.success) return fail("Loại tài liệu không hợp lệ", "validation");
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id").eq("id", businessId).maybeSingle();
  if (!business) return fail("Không tìm thấy business", "not_found");
  try {
    await assertDocAccess(businessId, t.data);
    const ctx = await buildGenerationContext(businessId, `doc:${Date.now()}`);
    const generated = genDocuments(ctx).documents.find((d) => d.type === t.data);
    if (!generated) return fail("Không tạo được tài liệu");
    const { data, error } = await supabase.from("documents").insert({ business_id: businessId, type: t.data, title: generated.title, content: generated.content as JsonValue }).select("*").single();
    if (error) return fail(error.message);
    await logActivity({ userId: profile.id, businessId, action: "document.created", entityType: "document", entityId: data.id, title: `Tạo tài liệu "${data.title}"` });
    revalidatePath(`/business/${businessId}/documents`);
    return ok(data, "Đã tạo tài liệu");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Không tạo được tài liệu");
  }
}

export async function updateDocumentAction(documentId: string, input: unknown): Promise<ActionResult<DocumentRow>> {
  const profile = await requireProfileAction();
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("documents").select("business_id, type, version").eq("id", documentId).maybeSingle();
  if (!existing) return fail("Không tìm thấy tài liệu", "not_found");
  try { await assertDocAccess(existing.business_id, existing.type); } catch (e) { return fail(e instanceof Error ? e.message : "Không có quyền", "forbidden"); }
  const { data, error } = await supabase.from("documents").update({ title: parsed.data.title, content: parsed.data.content as JsonValue, version: existing.version + 1 }).eq("id", documentId).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "document.updated", entityType: "document", entityId: data.id, title: `Sửa tài liệu "${data.title}"` });
  revalidatePath(`/business/${data.business_id}/documents`);
  return ok(data, "Đã lưu tài liệu");
}

export async function duplicateDocumentAction(documentId: string): Promise<ActionResult<DocumentRow>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data: src } = await supabase.from("documents").select("*").eq("id", documentId).maybeSingle();
  if (!src) return fail("Không tìm thấy tài liệu", "not_found");
  try { await assertDocAccess(src.business_id, src.type); } catch (e) { return fail(e instanceof Error ? e.message : "Không có quyền", "forbidden"); }
  const { data, error } = await supabase.from("documents").insert({ business_id: src.business_id, type: src.type, title: `${src.title} (bản sao)`, content: src.content as JsonValue }).select("*").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: src.business_id, action: "document.duplicated", entityType: "document", entityId: data.id, title: `Nhân bản tài liệu "${src.title}"` });
  revalidatePath(`/business/${src.business_id}/documents`);
  return ok(data, "Đã nhân bản");
}

export async function deleteDocumentAction(documentId: string): Promise<ActionResult<undefined>> {
  const profile = await requireProfileAction();
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").delete().eq("id", documentId).select("business_id, title").single();
  if (error) return fail(error.message);
  await logActivity({ userId: profile.id, businessId: data.business_id, action: "document.deleted", entityType: "document", entityId: documentId, title: `Xoá tài liệu "${data.title}"` });
  revalidatePath(`/business/${data.business_id}/documents`);
  return ok(undefined, "Đã xoá tài liệu");
}
