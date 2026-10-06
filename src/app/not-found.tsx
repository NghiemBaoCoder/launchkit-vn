import Link from "next/link";
import { Home, LayoutDashboard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotFoundIllustration } from "@/components/site/illustrations";

export default function NotFound() {
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-xs animate-float-slow sm:max-w-sm"><NotFoundIllustration /></div>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lỗi 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Không tìm thấy trang này</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Có thể đường dẫn đã thay đổi hoặc business bạn tìm đã bị xoá. Hãy quay lại trang chủ hoặc dashboard để tiếp tục.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild><Link href="/dashboard"><LayoutDashboard /> Vào dashboard</Link></Button>
        <Button asChild variant="outline"><Link href="/"><Home /> Trang chủ</Link></Button>
        <Button asChild variant="ghost"><Link href="/examples"><Search /> Xem ví dụ</Link></Button>
      </div>
    </div>
  );
}
