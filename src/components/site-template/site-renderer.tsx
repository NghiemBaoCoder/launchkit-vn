"use client";
import * as React from "react";
import type { WebsiteSection } from "@/lib/ai/types";
import { cn, formatVND } from "@/lib/utils";

export interface SiteTheme { primary: string; secondary: string; accent: string; bg: string; font: string; radius: string }
export interface SiteContact { email?: string; phone?: string; address?: string; facebook?: string; zalo?: string; instagram?: string; tiktok?: string; website?: string }

interface SiteRendererProps {
  business: { name: string; logo_url?: string | null };
  sections: WebsiteSection[];
  theme: SiteTheme;
  contact: SiteContact;
  /** Chế độ xem trước: không scroll-link, đánh dấu section được chọn. */
  preview?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  mode?: "desktop" | "mobile";
}

/** Template website 12 section — dùng chung cho studio preview và trang public. */
export function SiteRenderer({ business, sections, theme, contact, preview, selectedId, onSelect, mode = "desktop" }: SiteRendererProps) {
  const mobile = mode === "mobile";
  const style = { "--s-primary": theme.primary, "--s-secondary": theme.secondary, "--s-accent": theme.accent, "--s-bg": theme.bg, "--s-radius": theme.radius, fontFamily: `'${theme.font}', 'Be Vietnam Pro', system-ui, sans-serif` } as React.CSSProperties;
  const enabled = sections.filter((s) => s.enabled);
  const wrap = (s: WebsiteSection, node: React.ReactNode) => (
    <section
      key={s.id}
      id={s.id}
      data-section={s.id}
      onClick={preview && onSelect ? (e) => { e.preventDefault(); onSelect(s.id); } : undefined}
      className={cn("relative", preview && "cursor-pointer transition-shadow hover:shadow-[inset_0_0_0_2px_var(--s-primary)]", preview && selectedId === s.id && "shadow-[inset_0_0_0_3px_var(--s-primary)]")}
    >
      {preview ? <span className="absolute left-2 top-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity [section:hover>&]:opacity-100">{SECTION_LABELS[s.type]}</span> : null}
      {node}
    </section>
  );

  return (
    <div style={style} className="bg-[var(--s-bg)] text-slate-900">
      {enabled.map((s) => {
        const d = s.data as Record<string, unknown>;
        switch (s.type) {
          case "hero":
            return wrap(s, (
              <div className={cn("mx-auto max-w-6xl px-6 py-16 text-center", !mobile && "py-24")}>
                <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--s-primary)" }}>{business.logo_url ? <img src={business.logo_url} alt="" className="size-8 rounded-md object-cover" /> : null}{String(d.eyebrow ?? business.name)}</div>
                <h1 className={cn("mx-auto max-w-3xl font-extrabold leading-tight", mobile ? "text-3xl" : "text-5xl")}>{String(d.title ?? "")}</h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{String(d.subtitle ?? "")}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a href={String(d.cta_href ?? "#contact")} className="px-6 py-3 font-semibold text-white shadow-md" style={{ background: "var(--s-primary)", borderRadius: "var(--s-radius)" }}>{String(d.cta_label ?? "Liên hệ")}</a>
                  {d.secondary_label ? <a href={String(d.secondary_href ?? "#pricing")} className="border-2 px-6 py-3 font-semibold" style={{ borderColor: "var(--s-primary)", color: "var(--s-primary)", borderRadius: "var(--s-radius)" }}>{String(d.secondary_label)}</a> : null}
                </div>
                {d.badge ? <p className="mt-6 inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">✓ {String(d.badge)}</p> : null}
              </div>
            ));
          case "about":
            return wrap(s, (
              <div className={cn("mx-auto grid max-w-6xl gap-8 px-6 py-14", !mobile && "grid-cols-2 items-center")}>
                <div><h2 className="text-3xl font-bold">{String(d.title ?? "")}</h2><p className="mt-4 leading-relaxed text-slate-600">{String(d.body ?? "")}</p></div>
                <div className="grid grid-cols-1 gap-3">{((d.stats as { label: string }[]) ?? []).map((st, i) => <div key={i} className="bg-white p-4 text-sm font-semibold shadow-sm" style={{ borderRadius: "var(--s-radius)", borderLeft: "4px solid var(--s-accent)" }}>{st.label}</div>)}</div>
              </div>
            ));
          case "problem":
            return wrap(s, (
              <div className="bg-white"><div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "")}</h2><div className={cn("mt-8 grid gap-4", !mobile && "grid-cols-2")}>{((d.items as string[]) ?? []).map((it, i) => <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4"><span className="mt-0.5 text-xl">😮‍💨</span><span className="text-slate-700">{it}</span></div>)}</div></div></div>
            ));
          case "solution":
            return wrap(s, (
              <div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "")}</h2><div className={cn("mt-8 grid gap-4", !mobile && "grid-cols-2")}>{((d.items as { title: string; description: string }[]) ?? []).map((it, i) => <div key={i} className="bg-white p-5 shadow-sm" style={{ borderRadius: "var(--s-radius)" }}><div className="mb-2 inline-flex size-9 items-center justify-center rounded-full text-white" style={{ background: "var(--s-primary)" }}>{i + 1}</div><h3 className="font-semibold">{it.title}</h3><p className="mt-1 text-sm text-slate-600">{it.description}</p></div>)}</div></div>
            ));
          case "services":
            return wrap(s, (
              <div className="bg-white"><div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "Dịch vụ")}</h2>{d.subtitle ? <p className="mt-2 text-center text-slate-600">{String(d.subtitle)}</p> : null}<div className={cn("mt-8 grid gap-4", !mobile && "grid-cols-2 lg:grid-cols-4")}>{((d.items as { name: string; description: string; price_from?: number }[]) ?? []).map((it, i) => <div key={i} className="flex flex-col border p-5" style={{ borderRadius: "var(--s-radius)" }}><h3 className="font-semibold">{it.name}</h3><p className="mt-1 flex-1 text-sm text-slate-600">{it.description}</p>{it.price_from ? <p className="mt-3 text-sm font-semibold" style={{ color: "var(--s-primary)" }}>Từ {formatVND(it.price_from)}</p> : null}</div>)}</div></div></div>
            ));
          case "benefits":
            return wrap(s, (
              <div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "")}</h2><ul className={cn("mt-8 grid gap-3", !mobile && "grid-cols-2")}>{((d.items as string[]) ?? []).map((it, i) => <li key={i} className="flex items-start gap-3 bg-white p-4 shadow-sm" style={{ borderRadius: "var(--s-radius)" }}><span className="font-bold" style={{ color: "var(--s-secondary)" }}>✓</span>{it}</li>)}</ul></div>
            ));
          case "pricing":
            return wrap(s, (
              <div className="bg-white"><div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "Bảng giá")}</h2>{d.subtitle ? <p className="mt-2 text-center text-slate-600">{String(d.subtitle)}</p> : null}<div className={cn("mt-8 grid gap-4", !mobile && "grid-cols-3")}>{((d.tiers as { name: string; price: number; unit: string; features: string[]; highlight?: boolean }[]) ?? []).map((t, i) => <div key={i} className={cn("flex flex-col border p-6", t.highlight && "shadow-lg")} style={{ borderRadius: "var(--s-radius)", borderColor: t.highlight ? "var(--s-primary)" : undefined, borderWidth: t.highlight ? 2 : 1 }}>{t.highlight ? <span className="mb-2 self-start rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: "var(--s-accent)" }}>Phổ biến</span> : null}<h3 className="text-lg font-bold">{t.name}</h3><p className="mt-2 text-2xl font-extrabold">{formatVND(t.price)}<span className="text-sm font-normal text-slate-500"> / {t.unit}</span></p><ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">{t.features.map((f, j) => <li key={j}>✓ {f}</li>)}</ul><a href="#contact" className="mt-5 px-4 py-2 text-center font-semibold text-white" style={{ background: t.highlight ? "var(--s-primary)" : "var(--s-secondary)", borderRadius: "var(--s-radius)" }}>Chọn gói</a></div>)}</div></div></div>
            ));
          case "social_proof":
            return wrap(s, (
              <div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "")}</h2><div className={cn("mt-8 grid gap-4", !mobile && "grid-cols-3")}>{((d.items as { name: string; role: string; quote: string }[]) ?? []).map((t, i) => <figure key={i} className="bg-white p-5 shadow-sm" style={{ borderRadius: "var(--s-radius)" }}><blockquote className="text-slate-700">“{t.quote}”</blockquote><figcaption className="mt-3 text-sm"><strong>{t.name}</strong> · <span className="text-slate-500">{t.role}</span></figcaption></figure>)}</div></div>
            ));
          case "faq":
            return wrap(s, (
              <div className="bg-white"><div className="mx-auto max-w-3xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "FAQ")}</h2><div className="mt-8 divide-y">{((d.items as { q: string; a: string }[]) ?? []).map((f, i) => <details key={i} className="group py-3"><summary className="cursor-pointer list-none font-semibold">{f.q}</summary><p className="mt-2 text-sm text-slate-600">{f.a}</p></details>)}</div></div></div>
            ));
          case "cta":
            return wrap(s, (
              <div className="px-6 py-16 text-center text-white" style={{ background: `linear-gradient(135deg, var(--s-primary), var(--s-secondary))` }}><h2 className="text-3xl font-bold">{String(d.title ?? "")}</h2><p className="mt-3 opacity-90">{String(d.subtitle ?? "")}</p><a href={String(d.cta_href ?? "#contact")} className="mt-6 inline-block bg-white px-6 py-3 font-semibold" style={{ color: "var(--s-primary)", borderRadius: "var(--s-radius)" }}>{String(d.cta_label ?? "Liên hệ")}</a></div>
            ));
          case "contact":
            return wrap(s, (
              <div className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-center text-3xl font-bold">{String(d.title ?? "Liên hệ")}</h2>{d.subtitle ? <p className="mt-2 text-center text-slate-600">{String(d.subtitle)}</p> : null}<div className={cn("mt-8 grid gap-6", !mobile && "grid-cols-2")}>
                <div className="space-y-3 text-sm">
                  {contact.phone ? <p>📞 <a href={`tel:${contact.phone}`} className="font-medium">{contact.phone}</a></p> : <p className="text-slate-400">📞 Chưa có số điện thoại</p>}
                  {contact.email ? <p>✉️ <a href={`mailto:${contact.email}`} className="font-medium">{contact.email}</a></p> : null}
                  {contact.zalo ? <p>💬 Zalo: <span className="font-medium">{contact.zalo}</span></p> : null}
                  {contact.facebook ? <p>📘 <a href={contact.facebook} className="font-medium" target="_blank" rel="noreferrer">Facebook</a></p> : null}
                  {contact.address ? <p>📍 {contact.address}</p> : null}
                </div>
                {d.show_form !== false ? <form className="space-y-3 bg-white p-5 shadow-sm" style={{ borderRadius: "var(--s-radius)" }} onSubmit={(e) => e.preventDefault()}><input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Họ tên" /><input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Số điện thoại / Zalo" /><textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Bạn cần gì?" rows={3} /><button type="button" className="w-full px-4 py-2 font-semibold text-white" style={{ background: "var(--s-primary)", borderRadius: "var(--s-radius)" }} title="Form demo — kết nối email/Zalo để nhận tin">Gửi</button><p className="text-[11px] text-slate-400">Form minh hoạ — nối với email/Zalo của bạn khi triển khai thật.</p></form> : null}
              </div></div>
            ));
          case "footer":
            return wrap(s, (
              <footer className="border-t bg-white px-6 py-8 text-center text-sm text-slate-500"><p>{String(d.text ?? "")}</p><div className="mt-2 flex justify-center gap-4">{((d.links as { label: string; href: string }[]) ?? []).map((l, i) => <a key={i} href={l.href} className="hover:underline">{l.label}</a>)}</div></footer>
            ));
          default:
            return null;
        }
      })}
    </div>
  );
}

export const SECTION_LABELS: Record<WebsiteSection["type"], string> = { hero: "Hero", about: "Giới thiệu", problem: "Vấn đề", solution: "Giải pháp", services: "Dịch vụ", benefits: "Lợi ích", pricing: "Bảng giá", social_proof: "Khách nói gì", faq: "FAQ", cta: "Kêu gọi hành động", contact: "Liên hệ", footer: "Footer" };
