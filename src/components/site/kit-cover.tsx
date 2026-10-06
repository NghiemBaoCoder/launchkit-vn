import * as React from "react";
import { cn, initials } from "@/lib/utils";
import { CatalogIcon } from "@/components/site/catalog-icon";

export interface CoverPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg?: string;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gradient nền từ bảng màu thương hiệu (dùng chung cho thẻ, hero và ảnh OG). */
export function coverGradient(p: CoverPalette) {
  return `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 62%, ${p.accent} 100%)`;
}

interface KitCoverProps extends React.ComponentProps<"div"> {
  name: string;
  palette: CoverPalette;
  /** Tên icon lucide (CatalogIcon). */
  icon?: string | null;
  /** Seed để bố cục hình trang trí ổn định theo business. */
  seed?: string;
  size?: "thumb" | "card" | "hero";
  /** Ẩn chữ cái tắt / icon ở giữa. */
  hideMark?: boolean;
}

/**
 * "Ảnh bìa" sinh tự động cho một Business Kit: gradient theo bảng màu + hình học
 * bố trí theo seed. Thay cho ảnh stock — nhất quán, nhẹ, đẹp ở mọi kích cỡ.
 */
export function KitCover({ name, palette, icon, seed, size = "card", hideMark = false, className, children, style, ...props }: KitCoverProps) {
  const h = hash(seed ?? name);
  const cx = 55 + (h % 30); // 55–84%
  const cy = 10 + ((h >> 4) % 30); // 10–39%
  const rot = (h >> 8) % 360;
  const r1 = 26 + ((h >> 12) % 14);
  const r2 = 12 + ((h >> 16) % 10);
  const pattern = (h >> 20) % 3; // 0 lưới, 1 chấm, 2 vạch chéo
  const markSize = size === "hero" ? "size-16 text-2xl [&_svg]:size-8" : size === "thumb" ? "size-9 text-xs [&_svg]:size-4" : "size-12 text-base [&_svg]:size-6";

  return (
    <div className={cn("relative isolate overflow-hidden text-white", className)} style={{ background: coverGradient(palette), ...style }} {...props}>
      {/* Hoạ tiết nền */}
      <svg className="absolute inset-0 size-full opacity-[0.16] mix-blend-overlay" aria-hidden>
        <defs>
          <pattern id={`kc-${h}`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform={pattern === 2 ? "rotate(35)" : undefined}>
            {pattern === 0 ? <path d="M22 0H0V22" fill="none" stroke="#fff" strokeWidth="1" /> : null}
            {pattern === 1 ? <circle cx="3" cy="3" r="1.5" fill="#fff" /> : null}
            {pattern === 2 ? <rect width="2" height="22" fill="#fff" /> : null}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#kc-${h})`} />
      </svg>
      {/* Hình học */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute rounded-full bg-white/25 blur-2xl" style={{ width: `${r1 * 1.6}%`, paddingBottom: `${r1 * 1.6}%`, left: `${cx - r1}%`, top: `${cy - r1}%` }} />
        <span className="absolute rounded-full border-[6px] border-white/30" style={{ width: `${r1}%`, paddingBottom: `${r1}%`, left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%,-50%)" }} />
        <span className="absolute bg-white/20" style={{ width: `${r2}%`, paddingBottom: `${r2}%`, left: `${100 - cx}%`, top: `${90 - cy}%`, transform: `translate(-50%,-50%) rotate(${rot}deg)`, borderRadius: "22%" }} />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.35),transparent_55%)]" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
      </div>
      {!hideMark ? (
        <span className={cn("absolute left-4 top-4 flex items-center justify-center rounded-2xl bg-white/20 font-bold shadow-sm ring-1 ring-white/30 backdrop-blur", markSize)}>
          {icon ? <CatalogIcon name={icon} /> : initials(name)}
        </span>
      ) : null}
      {children}
    </div>
  );
}
