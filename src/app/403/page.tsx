import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForbiddenIllustration } from "@/components/site/illustrations";

export const metadata = { title: "Không có quyền truy cập" };

export default function ForbiddenPage() {
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-xs animate-float-slow sm:max-w-sm"><ForbiddenIllustration /></div>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lỗi 403</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Bạn không có quyền truy cập</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Khu vực này chỉ dành cho quản trị viên hoặc chủ sở hữu. Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ hỗ trợ.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild><Link href="/dashboard"><LayoutDashboard /> Về dashboard</Link></Button>
        <Button asChild variant="outline"><Link href="/contact">Liên hệ hỗ trợ</Link></Button>
      </div>
    </div>
  );
}
