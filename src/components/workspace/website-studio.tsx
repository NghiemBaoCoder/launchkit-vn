"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ExternalLink, Globe, Monitor, Palette, Phone, Save, Smartphone, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableList } from "./sortable-list";
import { StructuredEditor } from "./structured-editor";
import { SiteRenderer, SECTION_LABELS, type SiteContact, type SiteTheme } from "@/components/site-template/site-renderer";
import { publishWebsiteAction, saveWebsiteAction } from "@/lib/actions/website";
import type { WebsiteSection } from "@/lib/ai/types";
import type { WebsiteSite } from "@/types";
import { cn } from "@/lib/utils";
import { COLOR_PALETTES } from "@/lib/onboarding/schema";

const FONTS = ["Be Vietnam Pro", "Inter", "Montserrat", "Nunito", "Playfair Display", "Roboto", "Roboto Slab", "Quicksand", "Space Grotesk"];

export function WebsiteStudio({ businessId, site, business, appUrl }: { businessId: string; site: WebsiteSite; business: { name: string; logo_url: string | null }; appUrl: string }) {
  const router = useRouter();
  const [sections, setSections] = React.useState<WebsiteSection[]>((site.sections as unknown as WebsiteSection[]) ?? []);
  const [theme, setTheme] = React.useState<SiteTheme>({ primary: "#4F46E5", secondary: "#0EA5E9", accent: "#F59E0B", bg: "#F8FAFC", font: "Be Vietnam Pro", radius: "0.75rem", ...((site.theme as Partial<SiteTheme>) ?? {}) });
  const [contact, setContact] = React.useState<SiteContact>((site.contact as SiteContact) ?? {});
  const [slug, setSlug] = React.useState(site.slug);
  const [selected, setSelected] = React.useState<string | null>(sections[0]?.id ?? null);
  const [mode, setMode] = React.useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [panel, setPanel] = React.useState<"section" | "theme" | "contact">("section");

  const mark = () => setDirty(true);
  const sel = sections.find((s) => s.id === selected) ?? null;

  function updateSection(id: string, patch: Partial<WebsiteSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    mark();
  }

  async function save() {
    setSaving(true);
    const res = await saveWebsiteAction(businessId, { sections, theme, contact, slug });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    setDirty(false);
    setSlug(res.data.slug);
    toast.success(res.message);
    router.refresh();
  }

  async function togglePublish() {
    if (dirty) {
      const ok = await (async () => { setSaving(true); const r = await saveWebsiteAction(businessId, { sections, theme, contact, slug }); setSaving(false); if (!r.ok) { toast.error(r.error); return false; } setDirty(false); return true; })();
      if (!ok) return;
    }
    setPublishing(true);
    const res = await publishWebsiteAction(businessId, !site.is_published);
    setPublishing(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    router.refresh();
  }

  const publicUrl = `${appUrl}/site/${slug}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <Button size="sm" variant={mode === "desktop" ? "default" : "ghost"} onClick={() => setMode("desktop")}><Monitor /> Desktop</Button>
          <Button size="sm" variant={mode === "mobile" ? "default" : "ghost"} onClick={() => setMode("mobile")}><Smartphone /> Mobile</Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">/site/</span>
          <Input value={slug} onChange={(e) => { setSlug(e.target.value); mark(); }} className="h-8 w-44" />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {site.is_published ? <Badge variant="success"><Globe className="size-3" /> Đang public</Badge> : <Badge variant="secondary">Chưa xuất bản</Badge>}
          {site.is_published ? <Button asChild size="sm" variant="outline"><a href={publicUrl} target="_blank" rel="noreferrer"><ExternalLink /> Mở trang</a></Button> : null}
          <Button size="sm" variant="outline" onClick={togglePublish} loading={publishing}>{site.is_published ? <><EyeOff /> Gỡ xuống</> : <><Eye /> Xuất bản</>}</Button>
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty && slug === site.slug}><Save /> Lưu{dirty ? " *" : ""}</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
        <aside className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold"><LayoutList className="size-4" /> Các section</div>
          <div className="p-2">
            <SortableList
              items={sections}
              onReorder={(ids) => { setSections((prev) => ids.map((id) => prev.find((s) => s.id === id)!).filter(Boolean)); mark(); }}
              renderItem={(s, handle) => (
                <div className={cn("flex items-center gap-1 rounded-lg border px-1 py-1", selected === s.id && "border-primary bg-primary/5", !s.enabled && "opacity-60")}>
                  {handle}
                  <button type="button" className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => { setSelected(s.id); setPanel("section"); }}>{SECTION_LABELS[s.type]}</button>
                  <Switch checked={s.enabled} onCheckedChange={(v) => updateSection(s.id, { enabled: v })} aria-label="Bật/tắt section" />
                </div>
              )}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className={cn("mx-auto overflow-hidden rounded-xl border bg-white shadow-sm transition-all", mode === "mobile" ? "w-[390px] max-w-full" : "w-full")}>
            <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-green-400" /><span className="ml-2 truncate rounded bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{publicUrl}</span></div>
            <div className="max-h-[70vh] overflow-y-auto">
              <SiteRenderer business={business} sections={sections} theme={theme} contact={contact} preview selectedId={selected} onSelect={(id) => { setSelected(id); setPanel("section"); }} mode={mode} />
            </div>
          </div>
        </div>

        <aside className="rounded-xl border bg-card">
          <Tabs value={panel} onValueChange={(v) => setPanel(v as typeof panel)} className="gap-0">
            <TabsList className="m-2 w-auto"><TabsTrigger value="section">Section</TabsTrigger><TabsTrigger value="theme"><Palette /> Màu</TabsTrigger><TabsTrigger value="contact"><Phone /> Liên hệ</TabsTrigger></TabsList>
            <TabsContent value="section" className="max-h-[70vh] overflow-y-auto p-3">
              {sel ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">{SECTION_LABELS[sel.type]}</h3><label className="flex items-center gap-2 text-xs"><Switch checked={sel.enabled} onCheckedChange={(v) => updateSection(sel.id, { enabled: v })} /> Hiển thị</label></div>
                  <StructuredEditor value={sel.data as never} onChange={(v) => updateSection(sel.id, { data: v as Record<string, unknown> })} />
                </div>
              ) : <p className="text-sm text-muted-foreground">Chọn một section ở bên trái hoặc bấm vào preview.</p>}
            </TabsContent>
            <TabsContent value="theme" className="space-y-4 p-3">
              <div className="space-y-2">
                <Label>Bảng màu nhanh</Label>
                <div className="grid grid-cols-4 gap-2">{COLOR_PALETTES.map((p) => <button key={p.key} type="button" title={p.label} onClick={() => { setTheme((t) => ({ ...t, primary: p.primary, secondary: p.secondary, accent: p.accent, bg: p.bg })); mark(); }} className="flex h-8 overflow-hidden rounded-md border"><span className="flex-1" style={{ background: p.primary }} /><span className="flex-1" style={{ background: p.secondary }} /><span className="flex-1" style={{ background: p.accent }} /></button>)}</div>
              </div>
              {(["primary", "secondary", "accent", "bg"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2"><Label className="w-24 capitalize">{k === "bg" ? "Nền" : k === "primary" ? "Màu chính" : k === "secondary" ? "Màu phụ" : "Màu nhấn"}</Label><input type="color" value={theme[k]} onChange={(e) => { setTheme((t) => ({ ...t, [k]: e.target.value })); mark(); }} className="size-8 cursor-pointer rounded border" /><Input value={theme[k]} onChange={(e) => { setTheme((t) => ({ ...t, [k]: e.target.value })); mark(); }} className="h-8 font-mono text-xs" /></div>
              ))}
              <div className="space-y-1.5"><Label>Font</Label><select className="h-9 w-full rounded-lg border bg-background px-3 text-sm" value={theme.font} onChange={(e) => { setTheme((t) => ({ ...t, font: e.target.value })); mark(); }}>{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
              <div className="space-y-1.5"><Label>Bo góc</Label><select className="h-9 w-full rounded-lg border bg-background px-3 text-sm" value={theme.radius} onChange={(e) => { setTheme((t) => ({ ...t, radius: e.target.value })); mark(); }}><option value="0.25rem">Vuông (0.25rem)</option><option value="0.75rem">Vừa (0.75rem)</option><option value="1rem">Tròn (1rem)</option><option value="9999px">Viên thuốc</option></select></div>
            </TabsContent>
            <TabsContent value="contact" className="space-y-3 p-3">
              {([["phone", "Số điện thoại"], ["email", "Email"], ["zalo", "Zalo"], ["facebook", "Facebook (link)"], ["instagram", "Instagram (link)"], ["tiktok", "TikTok (link)"], ["address", "Địa chỉ"]] as const).map(([k, label]) => (
                <div key={k} className="space-y-1"><Label>{label}</Label><Input value={contact[k] ?? ""} onChange={(e) => { setContact((c) => ({ ...c, [k]: e.target.value })); mark(); }} /></div>
              ))}
              <p className="text-xs text-muted-foreground">Thông tin này hiển thị ở section Liên hệ của website.</p>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
