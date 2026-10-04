"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Gift, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/profile", label: "Hồ sơ", icon: User },
  { href: "/settings/security", label: "Bảo mật", icon: ShieldCheck },
  { href: "/settings/notifications", label: "Thông báo", icon: Bell },
  { href: "/settings/referrals", label: "Giới thiệu", icon: Gift },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Cài đặt tài khoản" className="-mx-4 overflow-x-auto no-scrollbar border-b px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
