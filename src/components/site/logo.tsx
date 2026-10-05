import { cn } from "@/lib/utils";

/**
 * Biểu tượng thương hiệu LaunchKit: khối "kit" xếp tầng + vệt phóng.
 * SVG thuần, dùng currentColor/gradient → dùng được ở header, footer, favicon, OG.
 */
export function Logo({ className, title = "LaunchKit VN" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} role="img" aria-label={title}>
      <defs>
        <linearGradient id="lk-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d5df6" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="lk-spark" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lk-bg)" />
      {/* ba lớp của kit */}
      <path d="M32 14 L50 24 L32 34 L14 24 Z" fill="#fff" fillOpacity="0.95" />
      <path d="M14 31 L32 41 L50 31 L50 36 L32 46 L14 36 Z" fill="#fff" fillOpacity="0.7" />
      <path d="M14 42 L32 52 L50 42 L50 47 L32 57 L14 47 Z" fill="#fff" fillOpacity="0.45" />
      {/* vệt phóng */}
      <path d="M44 8 L46.5 13.5 L52 16 L46.5 18.5 L44 24 L41.5 18.5 L36 16 L41.5 13.5 Z" fill="url(#lk-spark)" />
    </svg>
  );
}

/** Dấu + chữ, dùng ở footer / trang auth. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <Logo className="size-8" />
      <span>
        LaunchKit <span className="text-primary">VN</span>
      </span>
    </span>
  );
}
