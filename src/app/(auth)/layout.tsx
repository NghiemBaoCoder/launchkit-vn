import Link from "next/link";
import { Rocket } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-glow flex min-h-dvh flex-col">
      <header className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Rocket className="size-4" />
          </span>
          {SITE.name}
        </Link>
        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
          Bảng giá
        </Link>
      </header>
      <main className="container-x flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </main>
      <footer className="container-x py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. <Link href="/terms" className="hover:underline">Điều khoản</Link> · <Link href="/privacy" className="hover:underline">Bảo mật</Link>
      </footer>
    </div>
  );
}
