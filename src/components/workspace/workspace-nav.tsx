"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { WORKSPACE_SECTIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = { draft: "Nháp", generating: "Đang tạo", ready: "Sẵn sàng", archived: "Lưu trữ" };

export function WorkspaceNav({ business }: { business: { id: string; name: string; status: string; logo_url: string | null } }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {business.logo_url ? <img src={business.logo_url} alt="" className="size-full object-cover" /> : initials(business.name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{business.name}</div>
          <Badge variant={business.status === "ready" ? "success" : business.status === "generating" ? "info" : "secondary"} className="mt-0.5">{STATUS_LABEL[business.status] ?? business.status}</Badge>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 pb-3">
        {WORKSPACE_SECTIONS.map((s) => {
          const href = `/business/${business.id}/${s.key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.Circle;
          return (
            <Link key={s.key} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
              <Icon className="size-4" />
              {s.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
