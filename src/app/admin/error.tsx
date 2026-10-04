"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed px-4 py-16 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle className="size-7" /></div>
      <h1 className="text-xl font-bold">Không tải được trang quản trị</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu. Thử tải lại; nếu vẫn lỗi, kiểm tra log server hoặc kết nối Supabase.</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Mã lỗi: {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}><RefreshCw /> Thử lại</Button>
        <Button asChild variant="outline"><Link href="/admin"><LayoutDashboard /> Về tổng quan</Link></Button>
      </div>
    </div>
  );
}
