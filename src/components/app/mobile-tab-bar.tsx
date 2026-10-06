"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, Plus, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (p: string) => boolean;
  primary?: boolean;
}

const TABS: Tab[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, match: (p) => p === "/dashboard" },
  { href: "/dashboard/businesses", label: "Business", icon: Briefcase, match: (p) => p.startsWith("/dashboard/businesses") || p.startsWith("/business/") },
  { href: "/onboarding", label: "Tạo mới", icon: Plus, match: () => false, primary: true },
  { href: "/dashboard/purchases", label: "Đơn hàng", icon: ShoppingBag, match: (p) => p.startsWith("/dashboard/purchases") || p.startsWith("/dashboard/billing") },
  { href: "/settings/profile", label: "Tài khoản", icon: UserRound, match: (p) => p.startsWith("/settings") },
];

/** Thanh điều hướng đáy cho điện thoại / tablet dọc (ẩn từ lg). Chừa vùng an toàn iOS. */
export function MobileTabBar({ canCreate = true }: { canCreate?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-safe lg:hidden" aria-label="Điều hướng nhanh">
      <ul className="grid h-16 grid-cols-5">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const href = t.primary && !canCreate ? "/pricing" : t.href;
          return (
            <li key={t.href} className="flex">
              <Link
                href={href}
                className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}
                aria-current={active ? "page" : undefined}
              >
                {t.primary ? (
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lg shadow-primary/30 ring-4 ring-background">
                    <t.icon className="size-5" aria-hidden />
                  </span>
                ) : (
                  <t.icon className={cn("size-5", active && "scale-110")} aria-hidden />
                )}
                <span className={cn(t.primary && "-mt-0.5")}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
