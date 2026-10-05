"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/data/activity";
import { createNotification } from "@/lib/data/notifications";
import { fail, ok, type ActionResult, type UserRole } from "@/types";
import { adminActionError, zodFieldErrors, zodMessage } from "./admin-helpers";

const adjustSchema = z.object({
  userId: z.uuid("ID người dùng không hợp lệ"),
  amount: z.number().int("Số credits phải là số nguyên").refine((n) => n !== 0, "Số credits phải khác 0").refine((n) => Math.abs(n) <= 100000, "Tối đa 100.000 credits mỗi lần"),
  reason: z.string().trim().min(3, "Nhập lý do (tối thiểu 3 ký tự)").max(300, "Lý do tối đa 300 ký tự"),
});

/** Cộng/trừ credits cho người dùng qua RPC `adjust_credits` (nguyên tử, có ghi credit_transactions). */
export async function adjustUserCreditsAction(input: z.input<typeof adjustSchema>): Promise<ActionResult<{ balance: number }>> {
  try {
    const admin = await requireAdminAction();
    const parsed = adjustSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const { userId, amount, reason } = parsed.data;

    const service = createAdminClient();
    const { data: target } = await service.from("profiles").select("id, credits, email").eq("id", userId).maybeSingle();
    if (!target) return fail("Không tìm thấy người dùng", "not_found");

    const { data: balance, error } = await service.rpc("adjust_credits", { p_user_id: userId, p_amount: amount, p_reason: `[Admin] ${reason}`, p_ref_type: "admin", p_ref_id: admin.id, p_actor: admin.id });
    if (error) {
      if (error.message.includes("insufficient")) return fail(`Số dư hiện tại (${target.credits}) không đủ để trừ ${Math.abs(amount)} credits.`, "insufficient_credits");
      return fail(error.message);
    }

    await createNotification(userId, {
      type: "credits_adjusted",
      title: amount > 0 ? `Bạn được cộng ${amount} credits` : `Tài khoản bị trừ ${Math.abs(amount)} credits`,
      body: `${reason}. Số dư hiện tại: ${balance} credits.`,
      href: "/dashboard/billing",
    });
    await logAudit({ actorId: admin.id, action: "admin.credits.adjust", targetType: "profile", targetId: userId, before: { credits: target.credits }, after: { credits: balance }, metadata: { amount, reason } });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return ok({ balance: balance ?? 0 }, `Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} credits. Số dư mới: ${balance}.`);
  } catch (e) {
    return adminActionError(e);
  }
}

const roleSchema = z.object({ userId: z.uuid(), role: z.enum(["user", "admin", "super_admin"]) });

/** Đổi vai trò — chỉ super admin; không được đổi vai trò của chính mình. */
export async function changeUserRoleAction(input: z.input<typeof roleSchema>): Promise<ActionResult<{ role: UserRole }>> {
  try {
    const admin = await requireAdminAction({ superOnly: true });
    const parsed = roleSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation");
    const { userId, role } = parsed.data;
    if (userId === admin.id) return fail("Bạn không thể tự đổi vai trò của chính mình.", "forbidden");

    const supabase = await createClient();
    const { data: target } = await supabase.from("profiles").select("id, role, email").eq("id", userId).maybeSingle();
    if (!target) return fail("Không tìm thấy người dùng", "not_found");
    if (target.role === role) return ok({ role }, "Vai trò không thay đổi");

    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) return fail(error.message);

    await createNotification(userId, { type: "account", title: "Vai trò tài khoản đã thay đổi", body: `Vai trò mới của bạn: ${role === "user" ? "Người dùng" : role === "admin" ? "Admin" : "Super admin"}.`, href: "/settings/profile" });
    await logAudit({ actorId: admin.id, action: "admin.user.role_change", targetType: "profile", targetId: userId, before: { role: target.role }, after: { role }, metadata: { email: target.email } });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return ok({ role }, "Đã cập nhật vai trò");
  } catch (e) {
    return adminActionError(e);
  }
}

const suspendSchema = z.object({ userId: z.uuid(), reason: z.string().trim().min(5, "Nhập lý do tạm khoá (tối thiểu 5 ký tự)").max(500) });

/** Tạm khoá tài khoản: status=suspended, ghi lý do, thông báo cho người dùng. */
export async function suspendUserAction(input: z.input<typeof suspendSchema>): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    const parsed = suspendSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const { userId, reason } = parsed.data;
    if (userId === admin.id) return fail("Bạn không thể tự khoá tài khoản của chính mình.", "forbidden");

    const supabase = await createClient();
    const { data: target } = await supabase.from("profiles").select("id, role, status, email").eq("id", userId).maybeSingle();
    if (!target) return fail("Không tìm thấy người dùng", "not_found");
    if (target.status === "suspended") return fail("Tài khoản này đã bị tạm khoá.", "conflict");
    if (target.role === "super_admin") return fail("Không thể khoá tài khoản super admin.", "forbidden");
    if (target.role === "admin" && admin.role !== "super_admin") return fail("Chỉ super admin mới khoá được tài khoản admin.", "forbidden");

    const now = new Date().toISOString();
    const { error } = await supabase.from("profiles").update({ status: "suspended", suspended_at: now, suspended_reason: reason }).eq("id", userId);
    if (error) return fail(error.message);

    await createNotification(userId, { type: "account", title: "Tài khoản của bạn đã bị tạm khoá", body: `Lý do: ${reason}. Liên hệ hỗ trợ nếu bạn cho rằng đây là nhầm lẫn.`, href: "/contact" });
    await logAudit({ actorId: admin.id, action: "admin.user.suspend", targetType: "profile", targetId: userId, before: { status: target.status }, after: { status: "suspended", suspended_at: now }, metadata: { reason, email: target.email } });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return ok(undefined, "Đã tạm khoá tài khoản");
  } catch (e) {
    return adminActionError(e);
  }
}

/** Mở khoá tài khoản đã bị tạm khoá. */
export async function reactivateUserAction(userId: string): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(userId).success) return fail("ID không hợp lệ", "validation");

    const supabase = await createClient();
    const { data: target } = await supabase.from("profiles").select("id, status, email, suspended_reason").eq("id", userId).maybeSingle();
    if (!target) return fail("Không tìm thấy người dùng", "not_found");
    if (target.status === "active") return fail("Tài khoản đang hoạt động bình thường.", "conflict");

    const { error } = await supabase.from("profiles").update({ status: "active", suspended_at: null, suspended_reason: null }).eq("id", userId);
    if (error) return fail(error.message);

    await createNotification(userId, { type: "account", title: "Tài khoản đã được mở khoá", body: "Bạn có thể tiếp tục sử dụng LaunchKit VN bình thường.", href: "/dashboard" });
    await logAudit({ actorId: admin.id, action: "admin.user.reactivate", targetType: "profile", targetId: userId, before: { status: "suspended", suspended_reason: target.suspended_reason }, after: { status: "active" }, metadata: { email: target.email } });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return ok(undefined, "Đã mở khoá tài khoản");
  } catch (e) {
    return adminActionError(e);
  }
}
