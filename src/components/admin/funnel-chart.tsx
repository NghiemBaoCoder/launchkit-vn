import { formatNumber } from "@/lib/utils";
import type { FunnelStats } from "@/lib/data/admin-dashboard";

const STEPS: { key: keyof FunnelStats; label: string; hint: string }[] = [
  { key: "landing", label: "Xem landing", hint: "Khách truy cập trang chủ" },
  { key: "generator_start", label: "Bắt đầu tạo", hint: "Bấm bắt đầu onboarding" },
  { key: "signup", label: "Đăng ký", hint: "Tạo tài khoản" },
  { key: "generator_complete", label: "Tạo xong kit", hint: "Hoàn tất sinh nội dung" },
  { key: "preview", label: "Xem workspace", hint: "Mở workspace xem trước" },
  { key: "checkout", label: "Checkout", hint: "Tạo đơn hàng" },
  { key: "purchase", label: "Mua hàng", hint: "Đơn đã thanh toán" },
];

/** Phễu chuyển đổi: thanh ngang + % chuyển đổi giữa các bước. */
export function FunnelChart({ data, compact }: { data: FunnelStats; compact?: boolean }) {
  const values = STEPS.map((s) => Number(data[s.key]) || 0);
  const max = Math.max(1, ...values);
  return (
    <ol className="space-y-2">
      {STEPS.map((s, i) => {
        const v = values[i];
        const prev = i > 0 ? values[i - 1] : null;
        const rate = prev && prev > 0 ? v / prev : null;
        const width = Math.max(2, Math.round((v / max) * 100));
        return (
          <li key={s.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{s.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatNumber(v)}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-chart-1 transition-[width]" style={{ width: `${width}%` }} />
              </div>
              {!compact ? <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p> : null}
            </div>
            <div className="w-14 text-right text-xs tabular-nums text-muted-foreground">{rate === null ? "" : `${(rate * 100).toFixed(0)}%`}</div>
          </li>
        );
      })}
    </ol>
  );
}
