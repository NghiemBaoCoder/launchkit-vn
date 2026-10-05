"use client";
import { ContentView } from "./content-view";

export function BrandPaletteView({ content }: { content: Record<string, unknown> }) {
  const colors = ["primary", "secondary", "accent", "bg", "text", "muted"].filter((k) => typeof content[k] === "string");
  const usage = (content.usage as Record<string, string> | undefined) ?? {};
  return (
    <div className="space-y-4">
      <div className="flex h-16 w-full overflow-hidden rounded-xl border">
        {colors.slice(0, 4).map((k) => (<span key={k} className="flex-1" style={{ background: String(content[k]) }} title={k} />))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {colors.map((k) => (
          <div key={k} className="flex items-center gap-3 rounded-lg border p-2">
            <span className="size-10 shrink-0 rounded-md border" style={{ background: String(content[k]) }} />
            <div className="min-w-0 text-sm"><div className="font-medium capitalize">{k === "bg" ? "Nền" : k === "text" ? "Chữ" : k === "muted" ? "Chữ phụ" : k === "primary" ? "Màu chính" : k === "secondary" ? "Màu phụ" : "Màu nhấn"} <span className="font-mono text-xs text-muted-foreground">{String(content[k])}</span></div>{usage[k] ? <div className="truncate text-xs text-muted-foreground">{usage[k]}</div> : null}</div>
          </div>
        ))}
      </div>
      {content.label ? <p className="text-xs text-muted-foreground">Bảng màu: {String(content.label)}</p> : null}
    </div>
  );
}

export function TaglineView({ content }: { content: Record<string, unknown> }) {
  const options = (content.options as string[] | undefined) ?? [];
  const selected = content.selected as string | undefined;
  return (
    <div className="space-y-3">
      {selected ? <p className="rounded-xl bg-primary/5 p-4 text-center text-lg font-semibold text-primary">“{selected}”</p> : null}
      {options.length ? (
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Các phương án khác</div>
          <ul className="space-y-1 text-sm">{options.filter((o) => o !== selected).map((o) => <li key={o} className="rounded-md border px-3 py-1.5">{o}</li>)}</ul>
          <p className="mt-2 text-xs text-muted-foreground">Bấm &ldquo;Sửa&rdquo; để đổi tagline đã chọn.</p>
        </div>
      ) : null}
    </div>
  );
}

export function TypographyView({ content }: { content: Record<string, unknown> }) {
  const heading = String(content.heading ?? "Be Vietnam Pro");
  const body = String(content.body ?? "Inter");
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="text-2xl font-bold" style={{ fontFamily: `'${heading}', sans-serif` }}>{heading} — Tiêu đề mạnh mẽ</div>
        <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: `'${body}', sans-serif` }}>{body} — Đoạn nội dung dễ đọc, 2–3 câu, không dài dòng. Dùng cho mô tả, bài đăng và tài liệu.</p>
      </div>
      <ContentView value={{ scale: content.scale, notes: content.notes }} />
    </div>
  );
}
