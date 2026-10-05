"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cancelSubscriptionRenewalAction, renewSubscriptionNowAction, resumeSubscriptionRenewalAction } from "@/lib/actions/billing";
import { formatDate } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/payments/labels";

interface SubscriptionActionsProps {
  subscription: { id: string; status: SubscriptionStatus; cancel_at_period_end: boolean; current_period_end: string };
  /** Chỉ hiển thị hành động cho gói mới nhất của sản phẩm. */
  latest: boolean;
  /** Gói còn hiệu lực (tính ở server). */
  active: boolean;
}

export function SubscriptionActions({ subscription, latest, active }: SubscriptionActionsProps) {
  const router = useRouter();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [busy, setBusy] = React.useState<"resume" | "renew" | null>(null);
  if (!latest) return null;

  async function resume() {
    setBusy("resume");
    try {
      const res = await resumeSubscriptionRenewalAction(subscription.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message ?? "Đã bật lại gia hạn");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function renew() {
    setBusy("renew");
    try {
      const res = await renewSubscriptionNowAction(subscription.id);
      if (!res.ok) return void toast.error(res.error);
      router.push(res.data.redirectTo);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {active && !subscription.cancel_at_period_end ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setConfirmCancel(true)}><XCircle /> Huỷ gia hạn</Button>
      ) : null}
      {active && subscription.cancel_at_period_end ? (
        <Button type="button" variant="outline" size="sm" onClick={resume} loading={busy === "resume"}><RotateCcw /> Bật lại gia hạn</Button>
      ) : null}
      <Button type="button" variant={active ? "secondary" : "premium"} size="sm" onClick={renew} loading={busy === "renew"}><RefreshCw /> Gia hạn ngay</Button>
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        destructive
        title="Huỷ gia hạn Pro Membership?"
        description={`Gói vẫn hoạt động đến ${formatDate(subscription.current_period_end)}. Sau đó các quyền Pro sẽ không còn và bạn sẽ không bị tính phí thêm.`}
        confirmLabel="Huỷ gia hạn"
        cancelLabel="Giữ gói"
        onConfirm={async () => {
          const res = await cancelSubscriptionRenewalAction(subscription.id);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã huỷ gia hạn");
          router.refresh();
        }}
      />
    </div>
  );
}
