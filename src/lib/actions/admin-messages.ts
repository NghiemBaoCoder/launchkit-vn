"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { fail, ok, type ActionResult } from "@/types";
import { AuthError, requireAdminAction } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/data/activity";

const statusSchema = z.enum(["new", "read", "replied", "archived"]);
const schema = z.object({
  id: z.string().uuid(),
  status: statusSchema,
  adminNote: z.string().trim().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
});

function authFail(e: unknown) {
  return e instanceof AuthError ? fail(e.message, "forbidden") : fail("Không có quyền thực hiện", "forbidden");
}

/** Đổi trạng thái / ghi chú nội bộ cho một tin nhắn liên hệ. */
export async function updateContactMessageAction(input: { id: string; status: "new" | "read" | "replied" | "archived"; adminNote?: string }): Promise<ActionResult<undefined>> {
  let actor;
  try {
    actor = await requireAdminAction();
  } catch (e) {
    return authFail(e);
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const { id, status, adminNote } = parsed.data;
  const admin = createAdminClient();
  const { data: before } = await admin.from("contact_messages").select("id, status, admin_note").eq("id", id).maybeSingle();
  if (!before) return fail("Không tìm thấy tin nhắn", "not_found");
  const handled = status !== "new";
  const { error } = await admin
    .from("contact_messages")
    .update({ status, admin_note: adminNote ?? before.admin_note, handled_by: handled ? actor.id : null, handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return fail(error.message, "server");
  await logAudit({ actorId: actor.id, action: "admin.contact.update", targetType: "contact_message", targetId: id, before, after: { status, admin_note: adminNote ?? before.admin_note } });
  revalidatePath("/admin/messages");
  return ok(undefined, status === "archived" ? "Đã lưu trữ" : "Đã cập nhật");
}

/** Xoá hẳn một tin nhắn (spam). */
export async function deleteContactMessageAction(id: string): Promise<ActionResult<undefined>> {
  let actor;
  try {
    actor = await requireAdminAction();
  } catch (e) {
    return authFail(e);
  }
  if (!z.string().uuid().safeParse(id).success) return fail("Yêu cầu không hợp lệ", "validation");
  const admin = createAdminClient();
  const { data: before } = await admin.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("Không tìm thấy tin nhắn", "not_found");
  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) return fail(error.message, "server");
  await logAudit({ actorId: actor.id, action: "admin.contact.delete", targetType: "contact_message", targetId: id, before });
  revalidatePath("/admin/messages");
  return ok(undefined, "Đã xoá tin nhắn");
}
