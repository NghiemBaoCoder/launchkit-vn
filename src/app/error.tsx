"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = React.useSyncExternalStore(
    (cb) => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; },
    () => !navigator.onLine,
    () => false,
  );
  React.useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">{offline ? <WifiOff className="size-8" /> : <AlertTriangle className="size-8" />}</div>
      <h1 className="text-2xl font-bold">{offline ? "Bạn đang offline" : "Đã có lỗi xảy ra"}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {offline ? "Kiểm tra kết nối mạng rồi thử lại. Dữ liệu đã lưu của bạn vẫn an toàn." : "Chúng tôi đã ghi nhận sự cố. Bạn có thể thử tải lại, nếu vẫn lỗi hãy liên hệ hỗ trợ."}
      </p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Mã lỗi: {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}><RefreshCw /> Thử lại</Button>
        <Button asChild variant="outline"><Link href="/contact">Liên hệ hỗ trợ</Link></Button>
      </div>
    </div>
  );
}
