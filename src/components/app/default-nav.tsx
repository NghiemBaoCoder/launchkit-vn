"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CreditCard, Gift, LayoutDashboard, Plus, Settings, Shield, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/businesses", label: "Business của tôi", icon: Briefcase },
  { href: "/dashboard/purchases", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/dashboard/billing", label: "Gói & thanh toán", icon: CreditCard },
  { href: "/settings/referrals", label: "Giới thiệu bạn bè", icon: Gift },
  { href: "/settings/profile", label: "Cài đặt", icon: Settings },
];

export function DefaultNav({ isAdmin, canCreate }: { isAdmin: boolean; canCreate: boolean }) {
  const pathname = usePathname();
  return (
    <>
      <div className="p-3">
        <Button asChild className="w-full" variant={canCreate ? "default" : "outline"}><Link href={canCreate ? "/onboarding" : "/pricing"}><Plus /> {canCreate ? "Tạo business mới" : "Nâng cấp để tạo thêm"}</Link></Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-3">
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
    </>
  );
}
