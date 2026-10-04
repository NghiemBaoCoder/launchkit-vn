import Link from "next/link";
import { Compass, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Trang 404 trong khung site (header/footer). Vì (site)/loading.tsx tạo Suspense boundary,
 * notFound() ném sau khi shell đã stream nên HTTP status là 200 — thêm noindex để tránh soft-404 bị index.
 */
export default function SiteNotFound() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="surface-glow">
        <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="size-8" aria-hidden />
          </span>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lỗi 404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Không tìm thấy trang này</h1>
          <p className="mt-3 max-w-md text-muted-foreground">Đường dẫn có thể đã thay đổi, ví dụ hoặc loại hình bạn tìm không tồn tại. Hãy xem các ví dụ Business Kit hoặc quay lại trang chủ.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/examples">
                <Sparkles /> Xem ví dụ Business Kit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home /> Trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
