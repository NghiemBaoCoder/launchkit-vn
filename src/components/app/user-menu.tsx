"use client";
import Link from "next/link";
import { CreditCard, LogOut, Settings, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";
import type { Profile } from "@/types";
import { PLAN_LABELS, type PlanKey } from "@/lib/access/policy";

export function UserMenu({ profile, plan }: { profile: Profile; plan: PlanKey }) {
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" aria-label="Menu tài khoản">
        <Avatar>
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-semibold text-foreground">{profile.full_name || "Người dùng"}</div>
          <div className="truncate text-xs text-muted-foreground">{profile.email}</div>
          <div className="mt-1.5 flex items-center gap-2"><Badge variant={plan === "free" ? "secondary" : "premium"}>{PLAN_LABELS[plan]}</Badge><span className="text-xs text-muted-foreground">{profile.credits} credits</span></div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/settings/profile"><User /> Hồ sơ</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/billing"><CreditCard /> Gói & thanh toán</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/settings/security"><Settings /> Bảo mật</Link></DropdownMenuItem>
        {isAdmin ? (<><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/admin"><Shield /> Quản trị</Link></DropdownMenuItem></>) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOutAction()}><LogOut /> Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
