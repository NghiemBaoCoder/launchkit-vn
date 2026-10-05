"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getOrderStatusAction } from "@/lib/actions/checkout";
import { formatDateTime } from "@/lib/utils";

const INTERVAL_MS = 3000;

/** Hỏi trạng thái đơn mỗi 3 giây và chuyển trang khi có kết quả. */
export function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [checkedAt, setCheckedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let busy = false;
    async function tick() {
      if (busy) return;
      busy = true;
      try {
        const res = await getOrderStatusAction(orderId);
        if (cancelled) return;
        setCheckedAt(new Date());
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setError(null);
        if (res.data.status === "paid") router.replace(`/payment/success?order=${orderId}`);
        else if (res.data.status === "failed") router.replace(`/payment/failed?order=${orderId}`);
        else if (res.data.status === "expired") router.replace(`/payment/failed?order=${orderId}&reason=expired`);
      } finally {
        busy = false;
      }
    }
    void tick();
    const t = setInterval(tick, INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [orderId, router]);

  return (
    <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground" role="status" aria-live="polite">
      <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Đang chờ xác nhận từ cổng thanh toán…</span>
      {checkedAt ? <span className="text-xs">Kiểm tra lần cuối: {formatDateTime(checkedAt)}</span> : null}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
