"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark, type Brand } from "@/components/app/brand-mark";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/examples", label: "Ví dụ" },
  { href: "/how-it-works", label: "Cách hoạt động" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/faq", label: "FAQ" },
];

type AuthState = "unknown" | "in" | "out";

/**
 * Trạng thái đăng nhập đọc ở trình duyệt (từ cookie phiên Supabase) để layout public
 * không phải đọc cookie trên server → trang public prerender/ISR được, tải nhanh hơn.
 */
function useAuthState(): AuthState {
  const [state, setState] = React.useState<AuthState>("unknown");
  React.useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setState(data.session ? "in" : "out");
      })
      .catch(() => {
        if (active) setState("out");
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState(session ? "in" : "out");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

function AuthButtons({ state, mobile = false }: { state: AuthState; mobile?: boolean }) {
  if (state === "unknown") {
    return <span aria-hidden className={cn("block h-9 animate-pulse-soft rounded-lg bg-muted", mobile ? "w-full" : "w-44")} />;
  }
  if (state === "in") {
    return (
      <Button asChild className={mobile ? "w-full" : undefined}>
        <Link href="/dashboard">Vào dashboard</Link>
      </Button>
    );
  }
  return (
    <>
      <Button asChild variant={mobile ? "outline" : "ghost"} className={mobile ? "w-full" : undefined}>
        <Link href="/login">Đăng nhập</Link>
      </Button>
      <Button asChild className={mobile ? "w-full" : undefined}>
        <Link href="/onboarding">Tạo Business Kit</Link>
      </Button>
    </>
  );
}

export function SiteHeader({ brand = { name: "LaunchKit VN", logoUrl: null } }: { brand?: Brand }) {
  const pathname = usePathname();
  const auth = useAuthState();
  const [scrolled, setScrolled] = React.useState(false);
  // Lưu path lúc mở menu: đổi trang → open tự về false mà không cần setState trong effect.
  const [openPath, setOpenPath] = React.useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = () => setOpenPath((prev) => (prev === pathname ? null : pathname));

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300", scrolled || open ? "border-border bg-background/85 shadow-xs backdrop-blur-md" : "border-transparent bg-background/60 backdrop-blur")}>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <BrandMark brand={brand} />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Chính">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={cn("relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground", active ? "text-foreground" : "text-muted-foreground")} aria-current={active ? "page" : undefined}>
                {l.label}
                <span className={cn("absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300", active ? "scale-x-100" : "scale-x-0")} aria-hidden />
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <AuthButtons state={auth} />
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle} aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open ? (
        <div className="container-x border-t py-3 md:hidden animate-slide-up">
          <nav className="flex flex-col gap-1" aria-label="Chính (di động)">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <AuthButtons state={auth} mobile />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
