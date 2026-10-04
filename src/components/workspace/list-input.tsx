"use client";
import * as React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Nhập danh sách chuỗi (features, benefits...). */
export function ListInput({ value, onChange, placeholder, max = 20 }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; max?: number }) {
  const [draft, setDraft] = React.useState("");
  function add() {
    const v = draft.trim();
    if (!v || value.length >= max) return;
    onChange([...value, v]);
    setDraft("");
  }
  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {value.map((v, i) => (
          <li key={`${v}-${i}`} className="flex items-center gap-2">
            <Input value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xoá"><X /></Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={draft} placeholder={placeholder ?? "Thêm mục…"} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}><Plus /> Thêm</Button>
      </div>
    </div>
  );
}
