"use client";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { labelFor, HIDDEN_KEYS } from "@/lib/workspace/labels";
import { cn } from "@/lib/utils";

type JsonLike = string | number | boolean | null | JsonLike[] | { [k: string]: JsonLike };

interface Props {
  value: JsonLike;
  onChange: (next: JsonLike) => void;
  path?: string;
  depth?: number;
}

/**
 * Trình chỉnh sửa tổng quát cho nội dung jsonb: chuỗi → textarea/input, số → number,
 * mảng chuỗi → danh sách thêm/xoá, mảng object → nhóm lặp, object → nhóm trường.
 */
export function StructuredEditor({ value, onChange, path = "", depth = 0 }: Props) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const long = value.length > 60 || value.includes("\n");
    return long ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, Math.max(2, value.split("\n").length + 1))} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (typeof value === "number") return <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />;
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-primary" /> {value ? "Có" : "Không"}</label>
    );
  }
  if (Array.isArray(value)) {
    const isPrimitive = value.every((v) => typeof v !== "object" || v === null);
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={`${path}.${i}`} className={cn("flex gap-2", !isPrimitive && "rounded-lg border bg-muted/30 p-3")}>
            <div className="min-w-0 flex-1">
              {isPrimitive ? (
                <StructuredEditor value={item} onChange={(nv) => onChange(value.map((v, j) => (j === i ? nv : v)))} path={`${path}.${i}`} depth={depth + 1} />
              ) : (
                <>
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">#{i + 1}</div>
                  <StructuredEditor value={item} onChange={(nv) => onChange(value.map((v, j) => (j === i ? nv : v)))} path={`${path}.${i}`} depth={depth + 1} />
                </>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xoá mục"><Trash2 /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, isPrimitive ? "" : cloneShape(value[0])])}><Plus /> Thêm mục</Button>
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className={cn("grid gap-3", depth > 0 && "pl-0")}>
        {Object.entries(value)
          .filter(([k]) => !HIDDEN_KEYS.has(k))
          .map(([k, v]) => (
            <div key={`${path}.${k}`} className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">{labelFor(k)}</Label>
              <StructuredEditor value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} path={`${path}.${k}`} depth={depth + 1} />
            </div>
          ))}
      </div>
    );
  }
  return null;
}

function cloneShape(sample: JsonLike | undefined): JsonLike {
  if (sample === undefined || sample === null) return "";
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return [];
  const out: Record<string, JsonLike> = {};
  for (const [k, v] of Object.entries(sample)) out[k] = cloneShape(v);
  return out;
}
