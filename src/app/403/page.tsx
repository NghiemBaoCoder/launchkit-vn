import Link from "next/link";
import { ShieldAlert, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Không có quyền truy cập" };

export default function ForbiddenPage() {
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-warning/20 text-warning-foreground"><ShieldAlert className="size-8" /></div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lỗi 403</p>
      <h1 className="mt-2 text-3xl font-bold">Bạn không có quyền truy cập</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Khu vực này chỉ dành cho quản trị viên hoặc chủ sở hữu. Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ hỗ trợ.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild><Link href="/dashboard"><LayoutDashboard /> Về dashboard</Link></Button>
        <Button asChild variant="outline"><Link href="/contact">Liên hệ hỗ trợ</Link></Button>
      </div>
    </div>
  );
}
