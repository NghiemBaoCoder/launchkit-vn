"use client";
import * as React from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { CalendarDays, Check, FileText, Globe, Megaphone, MessageSquare, Package, Sparkles, Tags, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENERATION_STAGES } from "@/lib/ai/types";

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
const SPARK = [12, 18, 15, 24, 22, 30, 28, 38, 42, 40, 52, 60];

function sparkPath(values: number[], w: number, h: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / (max - min || 1)) * (h - 6) - 3] as const);
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return { d, area };
}

/** Vòng tiến độ 11 giai đoạn — vẽ dần rồi hiện "hoàn tất". */
function ProgressRing({ reduced }: { reduced: boolean }) {
  const [done, setDone] = React.useState(reduced);
  React.useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(t);
  }, [reduced]);
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-14">
        <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
          <circle cx="28" cy="28" r={r} className="fill-none stroke-muted" strokeWidth="5" />
          <m.circle
            cx="28"
            cy="28"
            r={r}
            className="fill-none stroke-primary"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduced ? 0 : c }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.4, ease: "easeInOut", delay: 0.3 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{done ? <Check className="size-5 text-success" /> : "11"}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Đang tạo kit</p>
        <p className="text-xs font-semibold">{done ? "11/11 phần hoàn tất" : `${GENERATION_STAGES.length} giai đoạn`}</p>
        {!done ? (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-primary animate-ping-soft" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Viết kịch bản bán hàng…
          </span>
        ) : (
          <span className="mt-1 inline-block rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">Sẵn sàng xuất PDF</span>
        )}
      </div>
    </div>
  );
}

function Sparkline({ reduced }: { reduced: boolean }) {
  const { d, area } = sparkPath(SPARK, 150, 44);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-muted-foreground">Doanh thu mục tiêu</p>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-success">
          <TrendingUp className="size-3" /> +38%
        </span>
      </div>
      <svg viewBox="0 0 150 44" className="mt-1 h-11 w-full overflow-visible">
        <defs>
          <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <m.path d={area} fill="url(#hero-spark-fill)" className="text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }} />
        <m.path
          d={d}
          className="stroke-primary"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.6 }}
        />
        <m.circle cx="150" cy={44 - ((60 - 12) / 48) * 38 - 3} r="3.5" className="fill-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.1, type: "spring", stiffness: 300 }} />
      </svg>
      <p className="mt-1 text-sm font-bold">45.000.000đ <span className="text-[10px] font-normal text-muted-foreground">/ tháng</span></p>
    </div>
  );
}

/**
 * Hình hero: workspace Business Kit đang được tạo, các thẻ nổi lơ lửng và
 * parallax nhẹ theo con trỏ. Thuần UI/SVG — không tải ảnh ngoài, chạy mượt trên mobile.
 */
export function HeroVisual({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const layerFar = { x: useTransform(sx, (v) => v * -10), y: useTransform(sy, (v) => v * -8) };
  const layerNear = { x: useTransform(sx, (v) => v * 16), y: useTransform(sy, (v) => v * 12) };
  const rotateY = useTransform(sx, (v) => v * 4);
  const rotateX = useTransform(sy, (v) => v * -4);

  React.useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, mx, my]);

  const enter = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className={cn("relative [perspective:1200px]", className)} aria-hidden>
      {/* hào quang */}
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-[10%] top-[5%] size-[55%] rounded-full bg-primary/25 blur-3xl animate-aurora" />
        <div className="absolute right-[5%] top-[30%] size-[45%] rounded-full bg-fuchsia-400/20 blur-3xl animate-aurora [animation-delay:-5s]" />
        <div className="absolute bottom-[0%] left-[30%] size-[40%] rounded-full bg-amber-300/25 blur-3xl animate-aurora [animation-delay:-9s]" />
      </div>

      {/* Workspace chính */}
      <m.div style={reduced ? undefined : { rotateX, rotateY }} {...enter(0.1)} className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5 will-change-transform dark:ring-white/10">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 h-5 flex-1 truncate rounded-md bg-background/80 px-2 text-[10px] leading-5 text-muted-foreground">launchkit.vn/business/minh-web-studio/brand</span>
        </div>
        <div className="grid grid-cols-[104px_1fr] sm:grid-cols-[140px_1fr]">
          <aside className="space-y-1 border-r bg-muted/20 p-2.5">
            <div className="mb-2 flex items-center gap-2 px-1.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">MW</span>
              <span className="truncate text-[11px] font-semibold">Minh Web Studio</span>
            </div>
            {NAV.map((n, i) => (
              <m.div
                key={n.label}
                className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]", n.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground")}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
              >
                <n.icon className="size-3.5" />
                <span className="truncate">{n.label}</span>
              </m.div>
            ))}
          </aside>
          <div className="space-y-3 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Thương hiệu</p>
                <p className="text-sm font-semibold">Định vị & tagline</p>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">9 tài sản</span>
            </div>
            <m.div className="rounded-xl border bg-background p-3" {...enter(0.5)}>
              <p className="text-[10px] font-medium text-muted-foreground">Tagline</p>
              <p className="mt-1 text-sm font-semibold leading-snug">Website lên nhanh, bán được ngay.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Làm đúng ngay từ đầu", "Bắt đầu đúng, lớn bền"].map((t) => (
                  <span key={t} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </m.div>
            <div className="grid grid-cols-2 gap-3">
              <m.div className="rounded-xl border bg-background p-3" {...enter(0.65)}>
                <p className="text-[10px] font-medium text-muted-foreground">Bảng màu</p>
                <div className="mt-2 flex gap-1.5">
                  {SWATCHES.map((c, i) => (
                    <m.span key={c} className="h-7 flex-1 rounded-md border" style={{ backgroundColor: c }} initial={reduced ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.9 + i * 0.08, duration: 0.35 }} />
                  ))}
                </div>
              </m.div>
              <m.div className="rounded-xl border bg-background p-3" {...enter(0.8)}>
                <p className="text-[10px] font-medium text-muted-foreground">Gói Tiêu chuẩn</p>
                <p className="mt-1 text-sm font-bold">8.900.000đ</p>
                <ul className="mt-1.5 space-y-0.5">
                  {["3 vòng chỉnh sửa", "Hỗ trợ 30 ngày"].map((f) => (
                    <li key={f} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Check className="size-3 text-success" /> {f}
                    </li>
                  ))}
                </ul>
              </m.div>
            </div>
            <m.div className="rounded-xl border bg-background p-3" {...enter(0.95)}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">Lịch nội dung 30 ngày</p>
                <p className="text-[10px] text-muted-foreground">Tuần 1–2</p>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <m.span
                    key={i}
                    className={cn("h-5 rounded-sm", i % 3 === 0 ? "bg-primary/70" : i % 3 === 1 ? "bg-fuchsia-400/60" : "bg-amber-400/60")}
                    initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + i * 0.05, duration: 0.3 }}
                  />
                ))}
              </div>
            </m.div>
          </div>
        </div>
      </m.div>

      {/* Thẻ nổi — lớp gần */}
      <m.div style={reduced ? undefined : layerNear} className="absolute -right-2 -top-6 hidden sm:block lg:-right-8">
        <m.div {...enter(1.2)} className="glass rounded-2xl border px-4 py-3 shadow-xl animate-float">
          <ProgressRing reduced={reduced} />
        </m.div>
      </m.div>
      <m.div style={reduced ? undefined : layerNear} className="absolute -bottom-8 -left-2 hidden w-48 sm:block lg:-left-10">
        <m.div {...enter(1.35)} className="glass rounded-2xl border px-4 py-3 shadow-xl animate-float-slow [animation-delay:-3s]">
          <Sparkline reduced={reduced} />
        </m.div>
      </m.div>
      {/* Thẻ nổi — lớp xa */}
      <m.div style={reduced ? undefined : layerFar} className="absolute -right-4 bottom-10 hidden md:block lg:-right-12">
        <m.div {...enter(1.5)} className="glass flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg animate-float [animation-delay:-2s]">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-300">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">Tài liệu</p>
            <p className="text-xs font-semibold">Báo giá · Hợp đồng · Hoá đơn</p>
          </div>
        </m.div>
      </m.div>
      <m.div style={reduced ? undefined : layerFar} className="absolute -left-6 top-10 hidden lg:block">
        <m.div {...enter(1.65)} className="glass flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg animate-float-slow">
          <span className="flex size-9 items-center justify-center rounded-xl bg-fuchsia-400/20 text-fuchsia-600 dark:text-fuchsia-300">
            <MessageSquare className="size-4" />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">Kịch bản bán hàng</p>
            <p className="text-xs font-semibold">6 từ chối đã có cách trả lời</p>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
