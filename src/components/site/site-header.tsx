"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/examples", label: "Ví dụ" },
  { href: "/how-it-works", label: "Cách hoạt động" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  // Lưu path lúc mở menu: đổi trang → open tự về false mà không cần setState trong effect.
  const [openPath, setOpenPath] = React.useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = React.useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setOpenPath((prev) => {
      const prevOpen = prev === pathname;
      const value = typeof next === "function" ? next(prevOpen) : next;
      return value ? pathname : null;
    });
  }, [pathname]);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="size-4" /></span>
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground", pathname.startsWith(l.href) ? "text-foreground" : "text-muted-foreground")}>{l.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Button asChild><Link href="/dashboard">Vào dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link href="/login">Đăng nhập</Link></Button>
              <Button asChild><Link href="/onboarding">Tạo Business Kit</Link></Button>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? <X /> : <Menu />}</Button>
      </div>
      {open ? (
        <div className="container-x border-t py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (<Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">{l.label}</Link>))}
            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? <Button asChild><Link href="/dashboard">Vào dashboard</Link></Button> : (<><Button asChild variant="outline"><Link href="/login">Đăng nhập</Link></Button><Button asChild><Link href="/onboarding">Tạo Business Kit</Link></Button></>)}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
