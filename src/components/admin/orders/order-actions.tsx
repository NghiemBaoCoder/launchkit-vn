"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { expireOrderAction, refundOrderAction } from "@/lib/actions/admin-orders";
import type { OrderStatus } from "@/types";

export function OrderActions({ orderId, orderNumber, status, entitlementCount }: { orderId: string; orderNumber: string; status: OrderStatus; entitlementCount: number }) {
  const router = useRouter();
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [expireOpen, setExpireOpen] = React.useState(false);

  if (status !== "paid" && status !== "pending") return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "paid" ? (
        <Button variant="destructive" size="sm" onClick={() => setRefundOpen(true)}><Undo2 /> Đánh dấu hoàn tiền</Button>
      ) : null}
      {status === "pending" ? (
        <Button variant="outline" size="sm" onClick={() => setExpireOpen(true)}><Clock /> Đánh dấu hết hạn</Button>
      ) : null}
      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        destructive
        typeToConfirm={orderNumber}
        title={`Hoàn tiền đơn ${orderNumber}?`}
        description={`Đơn sẽ chuyển sang "Đã hoàn tiền", các giao dịch thanh toán được đánh dấu hoàn, ${entitlementCount} quyền truy cập cấp bởi đơn này bị thu hồi và gói định kỳ (nếu có) bị huỷ. Việc chuyển tiền thực tế cần thực hiện thủ công ở cổng thanh toán.`}
        confirmLabel="Xác nhận hoàn tiền"
        onConfirm={async () => {
          const res = await refundOrderAction({ orderId });
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã hoàn tiền");
          router.refresh();
        }}
      />
      <ConfirmDialog
        open={expireOpen}
        onOpenChange={setExpireOpen}
        title={`Đánh dấu đơn ${orderNumber} hết hạn?`}
        description="Khách sẽ không thể thanh toán đơn này nữa và cần tạo đơn mới nếu muốn mua."
        confirmLabel="Đánh dấu hết hạn"
        onConfirm={async () => {
          const res = await expireOrderAction(orderId);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã cập nhật");
          router.refresh();
        }}
      />
    </div>
  );
}
