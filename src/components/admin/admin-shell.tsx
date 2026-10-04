"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, Cpu, FileCode2, Gift, Layers, LayoutDashboard, Menu, Package, Receipt, Settings, Shield, ShoppingBag, Sparkles, Tags, Users, ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import type { Profile } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  superOnly?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Tổng quan",
    items: [
      { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { href: "/admin/users", label: "Người dùng", icon: Users },
      { href: "/admin/businesses", label: "Business", icon: Briefcase },
      { href: "/admin/generations", label: "Generation", icon: Cpu },
    ],
  },
  {
    title: "Thương mại",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
      { href: "/admin/payments", label: "Thanh toán", icon: Receipt },
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/coupons", label: "Mã giảm giá", icon: Tags },
      { href: "/admin/affiliates", label: "Affiliate", icon: Gift },
    ],
  },
  {
    title: "Danh mục",
    items: [
      { href: "/admin/industries", label: "Ngành", icon: Layers },
      { href: "/admin/business-types", label: "Loại hình", icon: Briefcase },
      { href: "/admin/templates", label: "Template", icon: FileCode2 },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      { href: "/admin/settings/ai", label: "Cài đặt AI", icon: Sparkles },
      { href: "/admin/settings", label: "Cài đặt site", icon: Settings, exact: true, superOnly: true },
    ],
  },
];

/** Tiêu đề trang hiện tại cho topbar (mobile). */
function currentLabel(pathname: string): string {
  for (const s of SECTIONS) {
    for (const it of s.items) {
      if (it.exact ? pathname === it.href : pathname.startsWith(it.href)) {
        if (!it.exact || pathname === it.href) return it.label;
      }
    }
  }
  return "Quản trị";
}

export function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  // Sheet tự đóng khi đổi route: lưu pathname lúc mở, so với pathname hiện tại.
  const [openedAt, setOpenedAt] = React.useState<string | null>(null);
  const mobileOpen = openedAt === pathname;
  const setMobileOpen = (open: boolean) => setOpenedAt(open ? pathname : null);
  const isSuper = profile.role === "super_admin";

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    // Tránh "/admin/settings" sáng khi đang ở "/admin/settings/ai"
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Shield className="size-4" /></span>
          <span className="leading-tight">
            {SITE.shortName}
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quản trị</span>
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3" aria-label="Điều hướng quản trị">
        {SECTIONS.map((section) => {
          const items = section.items.filter((it) => !it.superOnly || isSuper);
          if (!items.length) return null;
          return (
            <div key={section.title}>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
          <ArrowLeft className="size-4" /> Về dashboard khách hàng
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-dvh">{sidebarBody}</div>
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
          {sidebarBody}
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu /></Button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold lg:hidden">{currentLabel(pathname)}</span>
            <Badge variant="info" className="hidden sm:inline-flex"><Shield /> Khu vực quản trị</Badge>
            {isSuper ? <Badge variant="premium">Super admin</Badge> : <Badge variant="secondary">Admin</Badge>}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href="/dashboard"><ArrowLeft /> Về dashboard khách hàng</Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Về dashboard khách hàng">
              <Link href="/dashboard"><ArrowLeft /></Link>
            </Button>
            <ThemeToggle />
            <UserMenu profile={profile} plan="pro_member" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
