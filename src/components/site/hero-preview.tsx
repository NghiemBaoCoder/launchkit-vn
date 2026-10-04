import { CalendarDays, Check, FileText, Globe, Megaphone, MessageSquare, Package, Sparkles, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: Sparkles, label: "Thương hiệu", active: true },
  { icon: Package, label: "Dịch vụ" },
  { icon: Tags, label: "Bảng giá" },
  { icon: MessageSquare, label: "Bán hàng" },
  { icon: Megaphone, label: "Marketing" },
  { icon: CalendarDays, label: "Nội dung" },
  { icon: Globe, label: "Website" },
  { icon: FileText, label: "Tài liệu" },
];

const SWATCHES = ["#4F46E5", "#0EA5E9", "#F59E0B", "#F8FAFC"];

/** Minh hoạ workspace Business Kit bằng UI thuần (không dùng ảnh ngoài). */
export function HeroPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-fuchsia-400/10 to-amber-300/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Thanh cửa sổ */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-background/80 px-2 text-[10px] leading-5 text-muted-foreground">launchkit.vn/dashboard/businesses/minh-web-studio</span>
        </div>
        <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[140px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-1 border-r bg-muted/20 p-2.5">
            <div className="mb-2 flex items-center gap-2 px-1.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">MW</span>
              <span className="truncate text-[11px] font-semibold">Minh Web Studio</span>
            </div>
            {NAV.map((n) => (
              <div key={n.label} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]", n.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground")}>
                <n.icon className="size-3.5" />
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </aside>
          {/* Nội dung */}
          <div className="space-y-3 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Thương hiệu</p>
                <p className="text-sm font-semibold">Định vị & tagline</p>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">11/11 hoàn tất</span>
            </div>
            <div className="rounded-xl border bg-background p-3 animate-slide-up" style={{ animationDelay: "120ms" }}>
              <p className="text-[10px] font-medium text-muted-foreground">Tagline</p>
              <p className="mt-1 text-sm font-semibold leading-snug">Website lên nhanh, bán được ngay.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Làm đúng ngay từ đầu", "Bắt đầu đúng, lớn bền"].map((t) => (
                  <span key={t} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-background p-3 animate-slide-up" style={{ animationDelay: "220ms" }}>
                <p className="text-[10px] font-medium text-muted-foreground">Bảng màu</p>
                <div className="mt-2 flex gap-1.5">
                  {SWATCHES.map((c) => (
                    <span key={c} className="h-7 flex-1 rounded-md border" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border bg-background p-3 animate-slide-up" style={{ animationDelay: "320ms" }}>
                <p className="text-[10px] font-medium text-muted-foreground">Gói Tiêu chuẩn</p>
                <p className="mt-1 text-sm font-bold">8.900.000đ</p>
                <ul className="mt-1.5 space-y-0.5">
                  {["3 vòng chỉnh sửa", "Hỗ trợ 30 ngày"].map((f) => (
                    <li key={f} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Check className="size-3 text-success" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-3 animate-slide-up" style={{ animationDelay: "420ms" }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">Lịch nội dung 30 ngày</p>
                <p className="text-[10px] text-muted-foreground">Tuần 1</p>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className={cn("h-5 rounded-sm", i % 3 === 0 ? "bg-primary/70" : i % 3 === 1 ? "bg-fuchsia-400/60" : "bg-amber-400/60")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Thẻ nổi */}
      <div className="absolute -bottom-5 -left-3 hidden rounded-xl border bg-card px-3 py-2 shadow-lg animate-slide-up sm:block" style={{ animationDelay: "560ms" }}>
        <p className="text-[10px] text-muted-foreground">Kịch bản bán hàng</p>
        <p className="text-xs font-semibold">6 từ chối đã có cách trả lời</p>
      </div>
      <div className="absolute -right-3 -top-4 hidden rounded-xl border bg-card px-3 py-2 shadow-lg animate-slide-up sm:block" style={{ animationDelay: "680ms" }}>
        <p className="text-[10px] text-muted-foreground">Tài liệu</p>
        <p className="text-xs font-semibold">Báo giá · Hợp đồng · Hoá đơn</p>
      </div>
    </div>
  );
}
