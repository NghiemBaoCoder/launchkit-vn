"use client";
import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics-client";

/** Ghi một sự kiện funnel khi trang được mở (mỗi path một lần / phiên). */
export function AnalyticsTracker({ event, properties }: { event: string; properties?: Record<string, unknown> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const ref = searchParams.get("ref") ?? undefined;
    const source = searchParams.get("utm_source") ?? searchParams.get("src") ?? (document.referrer ? new URL(document.referrer).hostname : undefined);
    track(event, { ...properties, ref, source, path: pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, event]);
  return null;
}
