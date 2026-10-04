"use client";
import * as React from "react";
import { WifiOff } from "lucide-react";

/** Hiển thị thanh thông báo khi mất kết nối mạng. */
export function OfflineBanner() {
  const [offline, setOffline] = React.useState(false);
  React.useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-foreground shadow-lg">
      <WifiOff className="size-4" />
      Bạn đang offline. Các thay đổi sẽ không được lưu cho đến khi có mạng trở lại.
    </div>
  );
}
