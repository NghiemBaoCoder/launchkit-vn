import type { Block } from "@/lib/export/outline";
import { cn } from "@/lib/utils";

/** Hiển thị outline (dùng cho xem trước tài liệu) — giống bố cục PDF. */
export function OutlineView({ title, subtitle, blocks, className }: { title: string; subtitle?: string; blocks: Block[]; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-white p-6 text-sm text-slate-900 shadow-xs sm:p-8 dark:bg-white", className)}>
      <h2 className="text-xl font-bold text-indigo-900">{title}</h2>
      {subtitle ? <p className="mb-4 text-xs text-slate-500">{subtitle}</p> : null}
      <div className="space-y-1.5">
        {blocks.map((b, i) => {
          switch (b.type) {
            case "h1": return <h3 key={i} className="mt-4 border-b border-indigo-200 pb-1 text-base font-bold text-indigo-900">{b.text}</h3>;
            case "h2": return <h4 key={i} className="mt-3 text-sm font-bold">{b.text}</h4>;
            case "h3": return <h5 key={i} className="mt-2 text-sm font-semibold">{b.text}</h5>;
            case "small": return <div key={i} className="mt-2 text-[11px] font-semibold uppercase text-slate-500">{b.text}</div>;
            case "p": return <p key={i} className="whitespace-pre-line leading-relaxed">{b.text}</p>;
            case "kv": return <div key={i} className="grid grid-cols-[140px_1fr] gap-2"><span className="text-slate-500">{b.label}</span><span className="font-medium">{b.value}</span></div>;
            case "bullets": return <ul key={i} className="list-disc space-y-0.5 pl-5">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
            case "numbered": return <ol key={i} className="list-decimal space-y-0.5 pl-5">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ol>;
            case "table": return (
              <table key={i} className="my-2 w-full border-collapse text-xs"><thead><tr>{b.headers.map((h, j) => <th key={j} className="border bg-indigo-50 p-1.5 text-left font-semibold">{h}</th>)}</tr></thead><tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className="border p-1.5 align-top">{c}</td>)}</tr>)}</tbody></table>
            );
            case "divider": return <hr key={i} className="my-3" />;
          }
        })}
      </div>
    </div>
  );
}
