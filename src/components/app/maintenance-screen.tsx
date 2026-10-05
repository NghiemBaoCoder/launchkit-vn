"use client";
import * as React from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Màn hình bảo trì; admin (theo claims JWT) vẫn thấy nội dung kèm banner cảnh báo. */
export function MaintenanceScreen({ siteName, supportEmail, children }: { siteName: string; supportEmail: string; children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  React.useEffect(() => {
    let active = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const role = (data.session?.user.app_metadata as { role?: string } | undefined)?.role;
        if (active) setIsAdmin(role === "admin" || role === "super_admin");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (isAdmin) {
    return (
      <>
        <div className="bg-warning px-4 py-1.5 text-center text-xs font-medium text-warning-foreground">Chế độ bảo trì đang bật — chỉ admin nhìn thấy nội dung này. Tắt trong Quản trị → Cài đặt.</div>
        {children}
      </>
    );
  }
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-warning/20 text-warning-foreground animate-float-slow"><Wrench className="size-8" /></div>
      <h1 className="text-3xl font-bold">{siteName} đang bảo trì</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Chúng tôi đang nâng cấp hệ thống và sẽ quay lại sớm. Dữ liệu của bạn vẫn an toàn. Cần hỗ trợ gấp? Email <a className="text-primary hover:underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
      <Button asChild variant="outline" className="mt-6"><Link href="/login">Đăng nhập (dành cho quản trị)</Link></Button>
    </div>
  );
}
