import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  trend?: number | null;
  className?: string;
}

function StatCard({ label, value, hint, icon: Icon, trend, className }: StatCardProps) {
  const up = typeof trend === "number" && trend >= 0;
  return (
    <Card className={cn("gap-2 px-5 py-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {(hint || typeof trend === "number") && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {typeof trend === "number" ? (
            <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-success" : "text-destructive")}>
              {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(trend * 100).toFixed(1)}%
            </span>
          ) : null}
          {hint}
        </div>
      )}
    </Card>
  );
}

export { StatCard };
