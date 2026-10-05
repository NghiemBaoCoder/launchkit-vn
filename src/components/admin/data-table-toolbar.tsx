"use client";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ToolbarFilter {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  /** Nhãn cho lựa chọn "tất cả". */
  allLabel?: string;
}

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  /** Phần tử bên phải (ví dụ nút "Tạo mới"). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Thanh công cụ cho bảng admin: ô tìm kiếm (GET ?q=) + các select lọc.
 * Mọi thay đổi được đẩy vào URL searchParams và reset về trang 1.
 */
export function DataTableToolbar({ searchPlaceholder = "Tìm kiếm…", filters = [], children, className }: DataTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const urlQ = sp.get("q") ?? "";
  const [q, setQ] = React.useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = React.useState(urlQ);
  if (urlQ !== prevUrlQ) {
    // Đồng bộ ô tìm kiếm khi URL đổi (back/forward, xoá lọc)
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  function push(update: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(update)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasFilters = Boolean(sp.get("q")) || filters.some((f) => sp.get(f.name));

  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center", className)}>
      <form
        role="search"
        className="flex flex-1 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: q.trim() });
        }}
      >
        <div className="relative flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="pl-9" aria-label="Tìm kiếm" />
        </div>
        <Button type="submit" variant="outline" size="default">Tìm</Button>
      </form>
      {filters.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">{f.label}</span>
              <Select value={sp.get(f.name) ?? ""} onChange={(e) => push({ [f.name]: e.target.value })} className="h-9 min-w-36" aria-label={f.label}>
                <option value="">{f.allLabel ?? `Tất cả ${f.label.toLowerCase()}`}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </label>
          ))}
          {hasFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => router.push(pathname)}><X /> Xoá lọc</Button>
          ) : null}
        </div>
      ) : hasFilters ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push(pathname)}><X /> Xoá lọc</Button>
      ) : null}
      {children ? <div className="flex items-center gap-2 md:ml-auto">{children}</div> : null}
    </div>
  );
}
