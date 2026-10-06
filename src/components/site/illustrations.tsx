import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Bộ minh hoạ SVG inline (không tải ảnh ngoài). Dùng màu theme qua CSS variables
 * nên tự hợp dark mode. Mỗi hình nhận className để chỉnh kích cỡ.
 */
type IllustrationProps = { className?: string; title?: string };

function Frame({ children, className, title, viewBox = "0 0 320 240" }: IllustrationProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className={cn("block h-auto w-full", className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {children}
    </svg>
  );
}

const P = "var(--primary)";
const C3 = "var(--chart-3)";
const C2 = "var(--chart-2)";
const MUTED = "var(--muted)";
const BORDER = "var(--border)";
const CARD = "var(--card)";
const FG = "var(--foreground)";

/** Bước 1: trả lời câu hỏi — bong bóng chat & chip chọn. */
export function QuestionsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="214" rx="120" ry="12" fill={MUTED} />
      <rect x="40" y="36" width="190" height="56" rx="16" fill={CARD} stroke={BORDER} />
      <rect x="56" y="52" width="110" height="8" rx="4" fill={FG} opacity="0.75" />
      <rect x="56" y="68" width="150" height="6" rx="3" fill={FG} opacity="0.25" />
      <path d="M58 92 L58 108 L78 92 Z" fill={CARD} stroke={BORDER} />
      <rect x="110" y="118" width="170" height="44" rx="14" fill={P} />
      <rect x="126" y="132" width="90" height="7" rx="3.5" fill="#fff" opacity="0.9" />
      <rect x="126" y="146" width="130" height="5" rx="2.5" fill="#fff" opacity="0.6" />
      <path d="M262 162 L262 178 L242 162 Z" fill={P} />
      <g>
        <rect x="40" y="178" width="64" height="22" rx="11" fill={CARD} stroke={BORDER} />
        <rect x="112" y="178" width="74" height="22" rx="11" fill={P} opacity="0.15" stroke={P} />
        <rect x="194" y="178" width="56" height="22" rx="11" fill={CARD} stroke={BORDER} />
        <rect x="52" y="187" width="40" height="4" rx="2" fill={FG} opacity="0.5" />
        <rect x="124" y="187" width="50" height="4" rx="2" fill={P} />
        <rect x="206" y="187" width="32" height="4" rx="2" fill={FG} opacity="0.5" />
      </g>
      <circle cx="268" cy="44" r="14" fill={C3} opacity="0.9" />
      <path d="M262 44 l4 4 l8 -9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** Bước 2: hệ thống tạo kit — các lớp xếp tầng được "in" ra. */
export function KitStackIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <defs>
        <linearGradient id="il-kit-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={P} />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="216" rx="124" ry="12" fill={MUTED} />
      <path d="M160 150 L250 196 L160 242 L70 196 Z" fill={BORDER} opacity="0.6" transform="translate(0,-30)" />
      <path d="M160 122 L250 168 L160 214 L70 168 Z" fill={CARD} stroke={BORDER} transform="translate(0,-26)" />
      <path d="M160 96 L250 142 L160 188 L70 142 Z" fill={P} opacity="0.18" stroke={P} transform="translate(0,-22)" />
      <path d="M160 70 L250 116 L160 162 L70 116 Z" fill="url(#il-kit-g)" transform="translate(0,-18)" />
      <g fill="#fff" opacity="0.9">
        <rect x="128" y="86" width="64" height="6" rx="3" />
        <rect x="118" y="100" width="84" height="5" rx="2.5" opacity="0.7" />
        <rect x="138" y="112" width="44" height="5" rx="2.5" opacity="0.5" />
      </g>
      <g>
        <path d="M250 34 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill={C3} />
        <path d="M62 44 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill={C2} />
        <circle cx="286" cy="90" r="4" fill={P} opacity="0.5" />
        <circle cx="40" cy="120" r="3" fill={C3} opacity="0.6" />
      </g>
    </Frame>
  );
}

/** Bước 3: chỉnh sửa & xuất — khung tài liệu với bút và file. */
export function DocumentsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="216" rx="120" ry="12" fill={MUTED} />
      <rect x="84" y="40" width="130" height="164" rx="12" fill={CARD} stroke={BORDER} transform="rotate(-6 149 122)" />
      <rect x="100" y="34" width="130" height="164" rx="12" fill={CARD} stroke={BORDER} />
      <path d="M196 34 h22 a12 12 0 0 1 12 12 v22 Z" fill={MUTED} />
      <rect x="116" y="60" width="70" height="8" rx="4" fill={FG} opacity="0.8" />
      <rect x="116" y="78" width="98" height="5" rx="2.5" fill={FG} opacity="0.3" />
      <rect x="116" y="90" width="88" height="5" rx="2.5" fill={FG} opacity="0.3" />
      <rect x="116" y="102" width="94" height="5" rx="2.5" fill={FG} opacity="0.3" />
      <rect x="116" y="122" width="98" height="30" rx="6" fill={P} opacity="0.12" />
      <rect x="124" y="131" width="48" height="5" rx="2.5" fill={P} />
      <rect x="124" y="141" width="70" height="4" rx="2" fill={P} opacity="0.6" />
      <rect x="116" y="162" width="60" height="5" rx="2.5" fill={FG} opacity="0.3" />
      <rect x="116" y="174" width="80" height="5" rx="2.5" fill={FG} opacity="0.3" />
      <g transform="rotate(35 236 150)">
        <rect x="228" y="110" width="16" height="80" rx="4" fill={C3} />
        <path d="M228 190 l8 16 l8 -16 Z" fill={FG} opacity="0.7" />
        <rect x="228" y="110" width="16" height="12" rx="3" fill={FG} opacity="0.25" />
      </g>
      <g>
        <rect x="36" y="150" width="54" height="22" rx="6" fill="#ef4444" />
        <text x="63" y="166" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="ui-sans-serif, system-ui">PDF</text>
        <rect x="36" y="180" width="54" height="22" rx="6" fill="#16a34a" />
        <text x="63" y="196" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="ui-sans-serif, system-ui">CSV</text>
      </g>
    </Frame>
  );
}

/** Lịch nội dung 30 ngày. */
export function CalendarIllustration(props: IllustrationProps) {
  const cells = Array.from({ length: 28 });
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="218" rx="124" ry="12" fill={MUTED} />
      <rect x="56" y="40" width="208" height="160" rx="14" fill={CARD} stroke={BORDER} />
      <rect x="56" y="40" width="208" height="34" rx="14" fill={P} />
      <rect x="56" y="60" width="208" height="14" fill={P} />
      <rect x="72" y="52" width="60" height="8" rx="4" fill="#fff" opacity="0.9" />
      <rect x="220" y="52" width="28" height="8" rx="4" fill="#fff" opacity="0.6" />
      {cells.map((_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = 68 + col * 27;
        const y = 86 + row * 27;
        const kind = i % 5;
        const fill = kind === 0 ? P : kind === 2 ? C3 : kind === 4 ? C2 : MUTED;
        return <rect key={i} x={x} y={y} width="21" height="21" rx="5" fill={fill} opacity={fill === MUTED ? 1 : 0.85} />;
      })}
      <circle cx="262" cy="48" r="16" fill={C3} />
      <text x="262" y="53" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif, system-ui">30</text>
    </Frame>
  );
}

/** Phóng — dùng cho trang thành công / empty state tích cực. */
export function LaunchIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <defs>
        <linearGradient id="il-rocket" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={P} />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="216" rx="110" ry="12" fill={MUTED} />
      <path d="M160 200 C150 170 150 150 160 130 C170 150 170 170 160 200 Z" fill={C3} opacity="0.85" />
      <path d="M160 190 C154 172 154 160 160 148 C166 160 166 172 160 190 Z" fill="#fff" opacity="0.8" />
      <g transform="translate(0,-10)">
        <path d="M160 36 C190 60 196 110 190 150 L130 150 C124 110 130 60 160 36 Z" fill="url(#il-rocket)" />
        <path d="M160 36 C175 56 182 90 182 150 L160 150 Z" fill="#fff" opacity="0.12" />
        <circle cx="160" cy="92" r="16" fill="#fff" />
        <circle cx="160" cy="92" r="11" fill={P} opacity="0.9" />
        <path d="M130 150 L104 176 L112 130 Z" fill={P} />
        <path d="M190 150 L216 176 L208 130 Z" fill={P} />
        <rect x="150" y="150" width="20" height="14" rx="3" fill={FG} opacity="0.6" />
      </g>
      <g fill={C3}>
        <circle cx="58" cy="60" r="3" />
        <circle cx="262" cy="52" r="4" />
        <circle cx="244" cy="108" r="2.5" />
        <circle cx="72" cy="128" r="2.5" />
      </g>
      <path d="M40 180 h30 M250 184 h30 M60 196 h14" stroke={BORDER} strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

/** Hộp trống — empty state. */
export function EmptyBoxIllustration(props: IllustrationProps) {
  return (
    <Frame {...props} viewBox="0 0 240 180">
      <ellipse cx="120" cy="158" rx="84" ry="9" fill={MUTED} />
      <path d="M48 76 L120 44 L192 76 L192 140 L120 172 L48 140 Z" fill={CARD} stroke={BORDER} />
      <path d="M48 76 L120 108 L192 76" fill="none" stroke={BORDER} />
      <path d="M120 108 L120 172" stroke={BORDER} />
      <path d="M48 76 L24 96 L96 128 L120 108 Z" fill={P} opacity="0.12" stroke={P} />
      <path d="M192 76 L216 96 L144 128 L120 108 Z" fill={P} opacity="0.12" stroke={P} />
      <path d="M86 30 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 Z" fill={C3} />
      <circle cx="166" cy="26" r="3" fill={P} opacity="0.5" />
      <circle cx="196" cy="48" r="2" fill={C2} opacity="0.7" />
    </Frame>
  );
}

/** 404 — la bàn / bản đồ lạc đường. */
export function NotFoundIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="216" rx="120" ry="12" fill={MUTED} />
      <circle cx="160" cy="120" r="70" fill={CARD} stroke={BORDER} />
      <circle cx="160" cy="120" r="56" fill="none" stroke={BORDER} strokeDasharray="4 6" />
      <path d="M160 70 L176 112 L160 104 L144 112 Z" fill={P} />
      <path d="M160 170 L144 128 L160 136 L176 128 Z" fill={FG} opacity="0.35" />
      <circle cx="160" cy="120" r="6" fill={C3} />
      <text x="48" y="60" fontSize="40" fontWeight="800" fill={P} opacity="0.12" fontFamily="ui-sans-serif, system-ui">4</text>
      <text x="246" y="60" fontSize="40" fontWeight="800" fill={P} opacity="0.12" fontFamily="ui-sans-serif, system-ui">4</text>
      <path d="M40 190 q30 -20 60 0 t60 0 t60 0 t60 0" fill="none" stroke={BORDER} strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

/** 403 — khiên và khoá. */
export function ForbiddenIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="216" rx="110" ry="12" fill={MUTED} />
      <path d="M160 36 L232 62 V120 C232 160 200 190 160 204 C120 190 88 160 88 120 V62 Z" fill={CARD} stroke={BORDER} />
      <path d="M160 52 L216 72 V120 C216 152 190 176 160 188 C130 176 104 152 104 120 V72 Z" fill={C3} opacity="0.15" />
      <rect x="136" y="110" width="48" height="40" rx="8" fill={C3} />
      <path d="M146 110 V98 a14 14 0 0 1 28 0 V110" fill="none" stroke={C3} strokeWidth="7" strokeLinecap="round" />
      <circle cx="160" cy="128" r="5" fill="#fff" />
      <rect x="158" y="130" width="4" height="10" rx="2" fill="#fff" />
    </Frame>
  );
}

/** 500 — dây cáp bị rút. */
export function ErrorIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="216" rx="120" ry="12" fill={MUTED} />
      <path d="M30 120 C70 120 80 150 120 150" fill="none" stroke={FG} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <rect x="112" y="134" width="36" height="32" rx="6" fill={FG} opacity="0.7" />
      <rect x="148" y="140" width="10" height="6" rx="2" fill={FG} opacity="0.7" />
      <rect x="148" y="154" width="10" height="6" rx="2" fill={FG} opacity="0.7" />
      <path d="M290 100 C250 100 240 130 200 130" fill="none" stroke={P} strokeWidth="6" strokeLinecap="round" />
      <rect x="176" y="114" width="36" height="32" rx="6" fill={P} />
      <circle cx="186" cy="124" r="3" fill="#fff" />
      <circle cx="186" cy="136" r="3" fill="#fff" />
      <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
        <path d="M164 118 l-6 -10" />
        <path d="M170 112 l-2 -12" />
        <path d="M158 126 l-10 -4" />
      </g>
      <text x="100" y="70" fontSize="36" fontWeight="800" fill={P} opacity="0.12" fontFamily="ui-sans-serif, system-ui">500</text>
    </Frame>
  );
}

/** Offline — đám mây + wifi gạch chéo. */
export function OfflineIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <ellipse cx="160" cy="216" rx="110" ry="12" fill={MUTED} />
      <path d="M92 164 a30 30 0 0 1 10 -58 a44 44 0 0 1 84 -8 a32 32 0 0 1 36 66 Z" fill={CARD} stroke={BORDER} />
      <g fill="none" stroke={P} strokeWidth="6" strokeLinecap="round">
        <path d="M128 136 a46 46 0 0 1 64 0" opacity="0.35" />
        <path d="M142 150 a26 26 0 0 1 36 0" opacity="0.6" />
      </g>
      <circle cx="160" cy="166" r="5" fill={P} />
      <path d="M120 112 L200 184" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

/** Minh hoạ trang auth — bảng điều khiển với biểu đồ tăng. */
export function AuthIllustration(props: IllustrationProps) {
  return (
    <Frame {...props} viewBox="0 0 360 300">
      <rect x="40" y="40" width="280" height="200" rx="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" />
      <rect x="60" y="60" width="90" height="10" rx="5" fill="#fff" opacity="0.9" />
      <rect x="60" y="80" width="140" height="6" rx="3" fill="#fff" opacity="0.5" />
      <g>
        <rect x="60" y="110" width="110" height="60" rx="12" fill="rgba(255,255,255,0.14)" />
        <rect x="190" y="110" width="110" height="60" rx="12" fill="rgba(255,255,255,0.14)" />
        <rect x="72" y="122" width="44" height="6" rx="3" fill="#fff" opacity="0.6" />
        <rect x="72" y="140" width="70" height="12" rx="4" fill="#fff" opacity="0.95" />
        <rect x="202" y="122" width="44" height="6" rx="3" fill="#fff" opacity="0.6" />
        <rect x="202" y="140" width="56" height="12" rx="4" fill="#fff" opacity="0.95" />
      </g>
      <polyline points="60,220 100,206 140,212 180,190 220,196 260,176 300,182" fill="none" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="300" cy="182" r="6" fill="#fde68a" />
      <g fill="#fff" opacity="0.8">
        <circle cx="330" cy="30" r="4" />
        <circle cx="26" cy="250" r="3" />
        <path d="M310 262 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
      </g>
    </Frame>
  );
}
