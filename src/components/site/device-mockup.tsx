import * as React from "react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps extends React.ComponentProps<"div"> {
  url?: string;
  /** Tự cuộn nội dung bên trong (CSS). */
  autoScroll?: boolean;
  /** Chiều cao vùng hiển thị (px) — cần cố định để tính quãng cuộn. */
  viewportHeight?: number;
  viewportClassName?: string;
}

/** Khung trình duyệt desktop. */
export function BrowserFrame({ url = "launchkit.vn", autoScroll = false, viewportHeight = 380, viewportClassName, className, children, ...props }: BrowserFrameProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/10", className)} {...props}>
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 h-5 flex-1 truncate rounded-md bg-background/80 px-2 text-[10px] leading-5 text-muted-foreground">{url}</span>
      </div>
      <div className={cn("relative overflow-hidden bg-background", viewportClassName)} style={{ height: viewportHeight, ["--viewport-h" as string]: `${viewportHeight}px` }}>
        <div className={cn(autoScroll && "animate-scroll-y will-change-transform")}>{children}</div>
      </div>
    </div>
  );
}

interface PhoneFrameProps extends React.ComponentProps<"div"> {
  autoScroll?: boolean;
  /** Chiều cao màn hình điện thoại (px). */
  viewportHeight?: number;
  viewportClassName?: string;
}

/** Khung điện thoại có tai thỏ và thanh home. */
export function PhoneFrame({ autoScroll = false, viewportHeight = 500, viewportClassName, className, children, ...props }: PhoneFrameProps) {
  return (
    <div className={cn("relative w-[250px] max-w-full rounded-[2.4rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-black/20 dark:border-zinc-700 dark:bg-zinc-700", className)} {...props}>
      <span className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-700" aria-hidden />
      <div className={cn("relative w-full overflow-hidden rounded-[2rem] bg-background", viewportClassName)} style={{ height: viewportHeight, ["--viewport-h" as string]: `${viewportHeight}px` }}>
        <div className={cn(autoScroll && "animate-scroll-y will-change-transform")}>{children}</div>
      </div>
      <span className="absolute bottom-2 left-1/2 z-10 h-1 w-20 -translate-x-1/2 rounded-full bg-white/70" aria-hidden />
    </div>
  );
}
