"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cancelOrderAction } from "@/lib/actions/checkout";

export function CancelOrderButton({ orderId, orderNumber, redirectTo, size = "default", variant = "ghost" }: { orderId: string; orderNumber: string; redirectTo?: string; size?: "default" | "sm"; variant?: "ghost" | "outline" }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)}><Ban /> Huỷ đơn</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Huỷ đơn hàng?"
        description={`Đơn ${orderNumber} sẽ được đánh dấu hết hạn. Bạn có thể tạo đơn mới bất cứ lúc nào.`}
        confirmLabel="Huỷ đơn"
        cancelLabel="Giữ lại"
        onConfirm={async () => {
          const res = await cancelOrderAction(orderId);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã huỷ đơn hàng");
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        }}
      />
    </>
  );
}
