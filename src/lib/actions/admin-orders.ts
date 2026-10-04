"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/data/activity";
import { createNotification } from "@/lib/data/notifications";
import { fail, ok, type ActionResult } from "@/types";
import { adminActionError } from "./admin-helpers";

function revalidateOrder(orderId: string, userId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
}

const refundSchema = z.object({ orderId: z.uuid(), note: z.string().trim().max(300).optional().default("") });

/**
 * Đánh dấu hoàn tiền: đơn → refunded, payments → refunded, thu hồi entitlements cấp bởi đơn,
 * huỷ subscription (nếu có), từ chối hoa hồng chưa trả. Việc chuyển tiền thực tế làm thủ công ở cổng thanh toán.
 */
export async function refundOrderAction(input: z.input<typeof refundSchema>): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    const parsed = refundSchema.safeParse(input);
    if (!parsed.success) return fail("Thông tin không hợp lệ", "validation");
    const { orderId, note } = parsed.data;

    const supabase = await createClient();
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!order) return fail("Không tìm thấy đơn hàng", "not_found");
    if (order.status !== "paid") return fail("Chỉ hoàn tiền được đơn đã thanh toán.", "conflict");

    const service = createAdminClient();
    const now = new Date().toISOString();

    const { error: orderErr } = await service.from("orders").update({ status: "refunded", refunded_at: now, metadata: { ...(order.metadata as Record<string, unknown>), refund: { by: admin.id, at: now, note } } }).eq("id", orderId);
    if (orderErr) return fail(orderErr.message);

    const [{ data: payments }, { data: removed }, { data: subs }, { data: commissions }] = await Promise.all([
      service.from("payments").update({ status: "refunded" }).eq("order_id", orderId).eq("status", "succeeded").select("id"),
      service.from("entitlements").delete().eq("order_id", orderId).select("id, key"),
      service.from("subscriptions").update({ status: "canceled", canceled_at: now, cancel_at_period_end: false }).eq("order_id", orderId).neq("status", "canceled").select("id"),
      service.from("commissions").update({ status: "rejected" }).eq("order_id", orderId).neq("status", "paid").select("id"),
    ]);

    await createNotification(order.user_id, { type: "system", title: `Đơn ${order.order_number} đã được hoàn tiền`, body: `Số tiền ${order.total.toLocaleString("vi-VN")}₫ sẽ được hoàn về phương thức thanh toán ban đầu. Quyền truy cập đi kèm đơn đã bị thu hồi.`, href: "/dashboard/purchases" });
    await logAudit({
      actorId: admin.id,
      action: "admin.order.refund",
      targetType: "order",
      targetId: orderId,
      before: { status: order.status, paid_at: order.paid_at },
      after: { status: "refunded", refunded_at: now },
      metadata: { note, order_number: order.order_number, total: order.total, payments_refunded: payments?.length ?? 0, entitlements_removed: removed?.map((r) => r.key) ?? [], subscriptions_canceled: subs?.length ?? 0, commissions_rejected: commissions?.length ?? 0 },
    });
    revalidateOrder(orderId, order.user_id);
    return ok(undefined, `Đã đánh dấu hoàn tiền đơn ${order.order_number} (thu hồi ${removed?.length ?? 0} quyền).`);
  } catch (e) {
    return adminActionError(e);
  }
}

/** Đánh dấu đơn đang chờ là hết hạn (khách không thanh toán). */
export async function expireOrderAction(orderId: string): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(orderId).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { data: order } = await supabase.from("orders").select("id, status, order_number, user_id").eq("id", orderId).maybeSingle();
    if (!order) return fail("Không tìm thấy đơn hàng", "not_found");
    if (order.status !== "pending") return fail("Chỉ đánh dấu hết hạn được đơn đang chờ thanh toán.", "conflict");

    const service = createAdminClient();
    const { error } = await service.from("orders").update({ status: "expired" }).eq("id", orderId);
    if (error) return fail(error.message);
    await service.from("payments").update({ status: "failed", error: "Đơn hàng hết hạn (admin)" }).eq("order_id", orderId).in("status", ["pending", "processing"]);
    await logAudit({ actorId: admin.id, action: "admin.order.expire", targetType: "order", targetId: orderId, before: { status: "pending" }, after: { status: "expired" }, metadata: { order_number: order.order_number } });
    revalidateOrder(orderId, order.user_id);
    return ok(undefined, `Đã đánh dấu đơn ${order.order_number} hết hạn.`);
  } catch (e) {
    return adminActionError(e);
  }
}
