import * as React from "react";
import { labelFor, HIDDEN_KEYS } from "@/lib/workspace/labels";
import { cn } from "@/lib/utils";

const COLOR_KEYS = new Set(["primary", "secondary", "accent", "bg", "text", "muted"]);
const isHex = (v: unknown) => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v);

/** Hiển thị nội dung jsonb bất kỳ một cách dễ đọc. */
export function ContentView({ value, depth = 0, className }: { value: unknown; depth?: number; className?: string }) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return <p className={cn("whitespace-pre-line text-sm leading-relaxed", className)}>{value}</p>;
  if (typeof value === "number") return <span className="text-sm font-medium tabular-nums">{value.toLocaleString("vi-VN")}</span>;
  if (typeof value === "boolean") return <span className="text-sm">{value ? "Có" : "Không"}</span>;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object" || v === null)) {
      return (
        <ul className={cn("space-y-1 text-sm", className)}>
          {value.map((v, i) => (<li key={i} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span className="whitespace-pre-line leading-relaxed">{String(v)}</span></li>))}
        </ul>
      );
    }
    return (
      <div className={cn("grid gap-2", depth === 0 && value.length > 2 && "sm:grid-cols-2", className)}>
        {value.map((v, i) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-3">
            <ContentView value={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0));
    const allColors = entries.length > 0 && entries.every(([k, v]) => COLOR_KEYS.has(k) ? isHex(v) : true) && entries.some(([k]) => COLOR_KEYS.has(k));
    return (
      <dl className={cn("grid gap-3", className)}>
        {allColors ? (
          <div className="flex flex-wrap gap-3">
            {entries.filter(([k, v]) => COLOR_KEYS.has(k) && isHex(v)).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 rounded-lg border p-2 pr-3">
                <span className="size-8 rounded-md border" style={{ background: String(v) }} />
                <div><div className="text-xs text-muted-foreground">{labelFor(k)}</div><div className="font-mono text-xs">{String(v)}</div></div>
              </div>
            ))}
          </div>
        ) : null}
        {entries.filter(([k, v]) => !(allColors && COLOR_KEYS.has(k) && isHex(v))).map(([k, v]) => {
          const simple = typeof v !== "object";
          return (
            <div key={k} className={cn(simple && depth > 0 && "grid grid-cols-[minmax(90px,30%)_1fr] gap-2")}>
              <dt className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", !simple && "mb-1.5")}>{labelFor(k)}</dt>
              <dd className="min-w-0"><ContentView value={v} depth={depth + 1} /></dd>
            </div>
          );
        })}
      </dl>
    );
  }
  return null;
}
