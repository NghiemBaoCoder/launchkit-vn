import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CoverPalette } from "@/components/site/kit-cover";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/** Nạp font Be Vietnam Pro (có sẵn trong public/fonts) cho ImageResponse. */
export async function loadOgFonts() {
  if (!fontCache) {
    const [regular, bold] = await Promise.all([
      readFile(join(process.cwd(), "public/fonts/BeVietnamPro-Regular.ttf")),
      readFile(join(process.cwd(), "public/fonts/BeVietnamPro-Bold.ttf")),
    ]);
    fontCache = { regular: toArrayBuffer(regular), bold: toArrayBuffer(bold) };
  }
  return [
    { name: "Be Vietnam Pro", data: fontCache.regular, weight: 400 as const, style: "normal" as const },
    { name: "Be Vietnam Pro", data: fontCache.bold, weight: 700 as const, style: "normal" as const },
  ];
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

const DEFAULT_PALETTE: CoverPalette = { primary: "#5b4df5", secondary: "#8b5cf6", accent: "#f59e0b" };

export function ogGradient(p: CoverPalette = DEFAULT_PALETTE) {
  return `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 62%, ${p.accent} 100%)`;
}

/** Logo LaunchKit dạng JSX đơn giản cho satori (không dùng <svg> gradient id trùng). */
export function OgLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "linear-gradient(135deg, #6d5df6, #c026d3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 64 64">
        <path d="M32 14 L50 24 L32 34 L14 24 Z" fill="#fff" fillOpacity="0.95" />
        <path d="M14 31 L32 41 L50 31 L50 36 L32 46 L14 36 Z" fill="#fff" fillOpacity="0.7" />
        <path d="M14 42 L32 52 L50 42 L50 47 L32 57 L14 47 Z" fill="#fff" fillOpacity="0.45" />
        <path d="M44 8 L46.5 13.5 L52 16 L46.5 18.5 L44 24 L41.5 18.5 L36 16 L41.5 13.5 Z" fill="#fbbf24" />
      </svg>
    </div>
  );
}

interface OgFrameProps {
  eyebrow?: string;
  title: string;
  description?: string;
  palette?: CoverPalette;
  chips?: string[];
  footer?: string;
}

/** Bố cục ảnh OG chuẩn 1200×630: nền gradient thương hiệu, tiêu đề lớn, chip. */
export function OgFrame({ eyebrow, title, description, palette, chips = [], footer = "launchkit.vn" }: OgFrameProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: ogGradient(palette),
        color: "#fff",
        fontFamily: "Be Vietnam Pro",
        position: "relative",
      }}
    >
      {/* hoạ tiết */}
      <div style={{ position: "absolute", right: -120, top: -140, width: 520, height: 520, borderRadius: 9999, background: "rgba(255,255,255,0.14)", display: "flex" }} />
      <div style={{ position: "absolute", right: 120, top: 90, width: 220, height: 220, borderRadius: 9999, border: "18px solid rgba(255,255,255,0.22)", display: "flex" }} />
      <div style={{ position: "absolute", left: -80, bottom: -160, width: 420, height: 420, borderRadius: 120, background: "rgba(0,0,0,0.12)", transform: "rotate(18deg)", display: "flex" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <OgLogo size={72} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>LaunchKit VN</div>
          <div style={{ fontSize: 20, opacity: 0.85 }}>Bộ khởi nghiệp hoàn chỉnh trong 10 phút</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
        {eyebrow ? <div style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, opacity: 0.9 }}>{eyebrow}</div> : null}
        <div style={{ fontSize: title.length > 48 ? 56 : 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, textWrap: "balance" }}>{title}</div>
        {description ? <div style={{ fontSize: 28, lineHeight: 1.35, opacity: 0.92 }}>{description}</div> : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {chips.slice(0, 4).map((c) => (
            <div key={c} style={{ display: "flex", padding: "10px 20px", borderRadius: 9999, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", fontSize: 22, fontWeight: 700 }}>
              {c}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.9 }}>{footer}</div>
      </div>
    </div>
  );
}
