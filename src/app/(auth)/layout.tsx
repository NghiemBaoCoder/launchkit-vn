import Link from "next/link";
import { Check } from "lucide-react";
import { SITE } from "@/lib/constants";
import { Logo } from "@/components/site/logo";
import { AuthIllustration } from "@/components/site/illustrations";
import { MotionProvider } from "@/components/motion/motion-provider";

const POINTS = ["Miễn phí để bắt đầu, không cần thẻ", "10 phần kit + 30 nội dung sẵn đăng", "Xuất PDF / CSV, chia sẻ link cho cộng sự"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* Bảng trái: thương hiệu (ẩn trên mobile) */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl animate-aurora" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-amber-300/20 blur-3xl animate-aurora [animation-delay:-6s]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12] [--foreground:#fff]" />
          <Link href="/" className="relative flex items-center gap-2 text-lg font-bold" aria-label="LaunchKit VN — Trang chủ">
            <Logo className="size-9" /> LaunchKit VN
          </Link>
          <div className="relative mx-auto w-full max-w-md animate-float-slow">
            <AuthIllustration />
          </div>
          <div className="relative max-w-md">
            <h2 className="text-balance text-3xl font-bold tracking-tight">Bắt đầu đúng ngay từ ngày đầu.</h2>
            <p className="mt-3 text-white/85">Trả lời 11 câu hỏi, nhận bộ khởi nghiệp hoàn chỉnh — viết riêng cho cách bạn kinh doanh.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/20"><Check className="size-3" aria-hidden /></span> {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form */}
        <div className="surface-glow flex min-h-dvh flex-col lg:min-h-0">
          <header className="container-x flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold" aria-label="LaunchKit VN — Trang chủ">
              <Logo className="size-8" /> <span className="lg:hidden">{SITE.name}</span>
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Bảng giá</Link>
          </header>
          <main className="container-x flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-md animate-slide-up">{children}</div>
          </main>
          <footer className="container-x pb-safe py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. <Link href="/terms" className="hover:underline">Điều khoản</Link> · <Link href="/privacy" className="hover:underline">Bảo mật</Link>
          </footer>
        </div>
      </div>
    </MotionProvider>
  );
}
