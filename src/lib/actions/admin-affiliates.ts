"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/data/activity";
import { createNotification } from "@/lib/data/notifications";
import { fail, ok, type ActionResult } from "@/types";
import { adminActionError, nullable, zodMessage } from "./admin-helpers";

const statusSchema = z.object({
  affiliateId: z.uuid(),
  status: z.enum(["pending", "approved", "rejected", "paid"]),
  notes: z.string().trim().max(500).optional().default(""),
});

const STATUS_LABEL: Record<z.infer<typeof statusSchema>["status"], string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", paid: "Đã thanh toán" };

/** Đổi trạng thái affiliate (duyệt / từ chối / đánh dấu đã thanh toán). */
export async function updateAffiliateStatusAction(input: z.input<typeof statusSchema>): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation");
    const { affiliateId, status, notes } = parsed.data;

    const supabase = await createClient();
    const { data: before } = await supabase.from("affiliates").select("id, status, notes, user_id, code").eq("id", affiliateId).maybeSingle();
    if (!before) return fail("Không tìm thấy affiliate", "not_found");

    const { error } = await supabase.from("affiliates").update({ status, notes: nullable(notes) ?? before.notes }).eq("id", affiliateId);
    if (error) return fail(error.message);

    if (before.status !== status) {
      await createNotification(before.user_id, {
        type: "account",
        title: `Chương trình giới thiệu: ${STATUS_LABEL[status]}`,
        body: status === "approved" ? `Mã giới thiệu ${before.code} đã được duyệt. Bạn sẽ nhận hoa hồng cho mỗi đơn thành công.` : status === "rejected" ? "Yêu cầu tham gia affiliate chưa được chấp thuận. Liên hệ hỗ trợ để biết thêm." : status === "paid" ? "Hoa hồng của bạn đã được thanh toán." : "Tài khoản affiliate đang chờ xét duyệt lại.",
        href: "/settings/referrals",
      });
    }
    await logAudit({ actorId: admin.id, action: "admin.affiliate.status", targetType: "affiliate", targetId: affiliateId, before: { status: before.status, notes: before.notes }, after: { status, notes: nullable(notes) ?? before.notes }, metadata: { code: before.code } });
    revalidatePath("/admin/affiliates");
    revalidatePath(`/admin/users/${before.user_id}`);
    return ok(undefined, `Đã cập nhật trạng thái: ${STATUS_LABEL[status]}`);
  } catch (e) {
    return adminActionError(e);
  }
}

const commissionSchema = z.object({ commissionId: z.uuid(), status: z.enum(["approved", "paid", "rejected"]) });

/** Cập nhật hoa hồng từng đơn — thanh toán thực hiện thủ công, tại đây chỉ ghi nhận. */
export async function updateCommissionStatusAction(input: z.input<typeof commissionSchema>): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    const parsed = commissionSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation");
    const { commissionId, status } = parsed.data;

    const supabase = await createClient();
    const { data: before } = await supabase.from("commissions").select("id, status, amount, affiliate_id, order_id, affiliates(user_id, code)").eq("id", commissionId).maybeSingle();
    if (!before) return fail("Không tìm thấy hoa hồng", "not_found");
    if (before.status === "paid" && status !== "paid") return fail("Hoa hồng đã thanh toán không thể đổi trạng thái.", "conflict");
    if (before.status === status) return ok(undefined, "Không có thay đổi");

    const { error } = await supabase.from("commissions").update({ status, paid_at: status === "paid" ? new Date().toISOString() : null }).eq("id", commissionId);
    if (error) return fail(error.message);

    if (status === "paid" && before.affiliates?.user_id) {
      await createNotification(before.affiliates.user_id, { type: "account", title: "Hoa hồng đã được thanh toán", body: `Khoản hoa hồng ${before.amount.toLocaleString("vi-VN")}₫ đã được chuyển cho bạn.`, href: "/settings/referrals" });
    }
    await logAudit({ actorId: admin.id, action: "admin.commission.status", targetType: "commission", targetId: commissionId, before: { status: before.status }, after: { status }, metadata: { amount: before.amount, affiliate_id: before.affiliate_id, order_id: before.order_id } });
    revalidatePath("/admin/affiliates");
    revalidatePath(`/admin/orders/${before.order_id}`);
    return ok(undefined, status === "paid" ? "Đã đánh dấu hoa hồng đã trả" : status === "approved" ? "Đã duyệt hoa hồng" : "Đã từ chối hoa hồng");
  } catch (e) {
    return adminActionError(e);
  }
}
