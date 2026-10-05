import Link from "next/link";
import { cn } from "@/lib/utils";

const OPTIONS: { days: 7 | 30 | 90; label: string }[] = [
  { days: 7, label: "7 ngày" },
  { days: 30, label: "30 ngày" },
  { days: 90, label: "90 ngày" },
];

/** Bộ chọn kỳ thống kê qua searchParam ?days=. */
export function PeriodSelector({ days, basePath }: { days: number; basePath: string }) {
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Chọn kỳ">
      {OPTIONS.map((o) => (
        <Link
          key={o.days}
          href={o.days === 30 ? basePath : `${basePath}?days=${o.days}`}
          role="tab"
          aria-selected={days === o.days}
          className={cn("rounded-md px-3 py-1 text-sm font-medium transition-colors", days === o.days ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
