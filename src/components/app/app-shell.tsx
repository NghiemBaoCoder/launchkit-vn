"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CreditCard, Download, Gift, LayoutDashboard, Menu, Plus, Rocket, Settings, ShoppingBag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { PLAN_LABELS, type PlanKey } from "@/lib/access/policy";
import type { Profile } from "@/types";
import { UserMenu } from "./user-menu";
import { NotificationsDropdown } from "./notifications-dropdown";
import { CommandSearch } from "./command-search";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/businesses", label: "Business của tôi", icon: Briefcase },
  { href: "/dashboard/purchases", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/dashboard/billing", label: "Gói & thanh toán", icon: CreditCard },
  { href: "/settings/referrals", label: "Giới thiệu bạn bè", icon: Gift },
  { href: "/settings/profile", label: "Cài đặt", icon: Settings },
];

interface AppShellProps {
  profile: Profile;
  plan: PlanKey;
  unread: number;
  children: React.ReactNode;
  /** Sidebar thay thế (ví dụ: workspace business). */
  sidebar?: React.ReactNode;
  sidebarTitle?: string;
}

export function AppShell({ profile, plan, unread, children, sidebar, sidebarTitle }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => setMobileOpen(false), [pathname]);
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link href="/admin" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith("/admin") ? "bg-sidebar-accent" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60")}>
          <Shield className="size-4" /> Quản trị
        </Link>
      ) : null}
    </nav>
  );

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="size-4" /></span>
          {SITE.name}
        </Link>
      </div>
      {sidebar ? (
        <div className="flex flex-1 flex-col overflow-y-auto">
          {sidebarTitle ? <div className="px-4 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sidebarTitle}</div> : null}
          {sidebar}
          <div className="mt-auto border-t border-sidebar-border p-3">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60"><LayoutDashboard className="size-4" /> Về Dashboard</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="p-3">
            <Button asChild className="w-full"><Link href="/onboarding"><Plus /> Tạo business mới</Link></Button>
          </div>
          {nav}
        </>
      )}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">{PLAN_LABELS[plan]}</span>
          <span className="text-muted-foreground">{profile.credits} credits</span>
        </div>
        <Progress value={Math.min(100, (profile.credits / 50) * 100)} className="mt-2 h-1.5" />
        {plan === "free" ? (
          <Button asChild variant="premium" size="sm" className="mt-3 w-full"><Link href="/pricing">Nâng cấp</Link></Button>
        ) : (
          <Link href="/dashboard/billing" className="mt-2 block text-xs text-primary hover:underline">Quản lý gói</Link>
        )}
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
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {sidebarBody}
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu /></Button>
          <CommandSearch />
          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Tải xuống"><Link href="/dashboard/businesses"><Download /></Link></Button>
            <ThemeToggle />
            <NotificationsDropdown initialUnread={unread} />
            <UserMenu profile={profile} plan={plan} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
