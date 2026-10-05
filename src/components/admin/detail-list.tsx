import * as React from "react";
import { cn } from "@/lib/utils";

/** Danh sách nhãn/giá trị dùng trong các card chi tiết. */
export function DetailList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-muted-foreground">{it.label}</dt>
          <dd className="min-w-0 text-right font-medium break-words">{it.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
