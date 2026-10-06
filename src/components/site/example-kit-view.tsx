import Link from "next/link";
import { ArrowRight, Check, Clock, Lock, MessageSquare, Quote, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVND, initials, cn } from "@/lib/utils";
import { BRAND_PERSONALITIES, SALES_CHANNELS, paletteByKey } from "@/lib/onboarding/schema";
import { KitCover } from "./kit-cover";
import { findAsset, type GeneratedExample } from "@/lib/examples";
import { PaletteSwatches } from "./asset-content-view";
import { CatalogIcon } from "./catalog-icon";

const KIND_LABEL: Record<string, string> = { task: "Việc cần làm", campaign: "Chiến dịch", promotion: "Khuyến mãi", content: "Nội dung" };
const KIND_VARIANT: Record<string, "secondary" | "info" | "warning" | "success"> = { task: "secondary", campaign: "info", promotion: "warning", content: "success" };
const PLATFORM_LABEL: Record<string, string> = { facebook: "Facebook", tiktok: "TikTok", instagram: "Instagram", threads: "Threads" };
const TYPE_ICON: Record<string, string> = { freelancer: "Laptop", creator: "Clapperboard", salon: "Scissors", "online-shop": "ShoppingBag", agency: "Building", fnb: "Coffee", coach: "GraduationCap", "local-service": "Wrench" };

const SECTIONS = [
  { id: "brand", label: "Thương hiệu" },
  { id: "services", label: "Dịch vụ" },
  { id: "pricing", label: "Bảng giá" },
  { id: "sales", label: "Bán hàng" },
  { id: "marketing", label: "Marketing" },
  { id: "content", label: "Nội dung" },
  { id: "website", label: "Website" },
];

type Tagline = { options?: string[]; selected?: string };
type Positioning = { statement?: string; for_whom?: string; unlike?: string; because?: string };
type ValueProp = { headline?: string; subheadline?: string; pillars?: { title: string; description: string }[] };
type Persona = { name?: string; age_range?: string; occupation?: string; description?: string; goals?: string[]; pains?: string[]; quote?: string };
type Typography = { heading?: string; body?: string; notes?: string[] };
type Pitch = { text?: string; duration?: string };
type Objections = { items?: { objection: string; response: string }[] };
type Overview = { summary?: string; goals?: string[]; kpis?: { name: string; target: string | number }[] };

function KitSection({ id, eyebrow, title, description, children }: { id: string; eyebrow: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t pt-10 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
      {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function LockedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-dashed bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
      <Lock className="size-3.5" aria-hidden /> {children}
    </p>
  );
}

export function ExampleKitView({ example }: { example: GeneratedExample }) {
  const { kit, brand, services, pricing, sales, marketing, content, website } = example;
  const assets = brand.assets;
  const tagline = findAsset(assets, "tagline")?.content as Tagline | undefined;
  const positioning = findAsset(assets, "positioning")?.content as Positioning | undefined;
  const valueProp = findAsset(assets, "value_proposition")?.content as ValueProp | undefined;
  const persona = findAsset(assets, "persona")?.content as Persona | undefined;
  const palette = findAsset(assets, "palette")?.content as Record<string, unknown> | undefined;
  const typography = findAsset(assets, "typography")?.content as Typography | undefined;
  const pitch = findAsset(sales.assets, "elevator_pitch")?.content as Pitch | undefined;
  const objections = (findAsset(sales.assets, "objections")?.content as Objections | undefined)?.items?.slice(0, 2) ?? [];
  const overview = findAsset(marketing.assets, "overview")?.content as Overview | undefined;
  const planDays = marketing.plan.filter((d) => d.day_index <= 7).sort((a, b) => a.day_index - b.day_index);
  const hero = website.sections.find((s) => s.type === "hero")?.data as { eyebrow?: string; title?: string; subtitle?: string; cta_label?: string; secondary_label?: string; badge?: string } | undefined;
  const contentItems = content.slice(0, 5);
  const personalities = kit.answers.brandPersonality.map((k) => BRAND_PERSONALITIES.find((p) => p.key === k)?.label ?? k);
  const channels = kit.answers.salesChannels.map((k) => SALES_CHANNELS.find((c) => c.key === k)?.label ?? k);
  const onboardingHref = `/onboarding?type=${kit.businessTypeSlug}`;
  const cover = paletteByKey(kit.answers.colorPalette);

  return (
    <div className="pb-24 lg:pb-0">
      {/* Header */}
      <div className="surface-glow border-b">
        <div className="container-x py-12 sm:py-16">
          <Link href="/examples" className="text-sm text-muted-foreground hover:text-foreground">← Tất cả ví dụ</Link>
          <KitCover name={kit.name} palette={cover} icon={TYPE_ICON[kit.businessTypeSlug]} seed={kit.slug} hideMark className="mt-4 h-36 rounded-3xl shadow-lg sm:h-44">
            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-85">Ví dụ Business Kit</p>
                <p className="text-sm opacity-90">{kit.businessTypeName} · {kit.industryName}</p>
              </div>
              <div className="flex gap-1.5">
                {[cover.primary, cover.secondary, cover.accent].map((c) => (
                  <span key={c} className="size-6 rounded-full ring-2 ring-white/60" style={{ background: c }} aria-hidden />
                ))}
              </div>
            </div>
          </KitCover>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${website.theme.primary}, ${website.theme.secondary})` }}>
                  <CatalogIcon name={TYPE_ICON[kit.businessTypeSlug]} className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{kit.businessTypeName} · {kit.industryName}</p>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{kit.name}</h1>
                </div>
              </div>
              {tagline?.selected ? <p className="mt-4 text-xl font-medium">“{tagline.selected}”</p> : null}
              <p className="mt-3 text-muted-foreground">{kit.summary}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {kit.tags.map((t, idx) => (
                  <Badge key={`${t}-${idx}`} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
            <nav aria-label="Các phần của kit" className="flex flex-wrap gap-1.5 lg:max-w-sm lg:justify-end">
              {SECTIONS.map((s, idx) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px] lg:py-16">
        <div className="min-w-0 space-y-12">
          {/* THƯƠNG HIỆU */}
          <KitSection id="brand" eyebrow="01 · Thương hiệu" title="Định vị, tagline & nhận diện" description="9 tài sản thương hiệu được tạo từ tính cách, khách hàng mục tiêu và sản phẩm của bạn.">
            {positioning?.statement ? (
              <blockquote className="relative rounded-2xl border bg-card p-6 shadow-xs">
                <Quote className="absolute right-5 top-5 size-6 text-primary/20" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tuyên bố định vị</p>
                <p className="mt-2 text-lg font-medium leading-relaxed">{positioning.statement}</p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {positioning.unlike ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Khác với</dt>
                      <dd>{positioning.unlike}</dd>
                    </div>
                  ) : null}
                  {positioning.because ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Bởi vì</dt>
                      <dd>{positioning.because}</dd>
                    </div>
                  ) : null}
                </dl>
              </blockquote>
            ) : null}

            {tagline?.options?.length ? (
              <div>
                <h3 className="text-sm font-semibold">5 phương án tagline</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagline.options.map((t, idx) => (
                    <span key={`${t}-${idx}`} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", t === tagline.selected ? "border-primary bg-primary/10 font-medium text-primary" : "bg-card")}>
                      {t === tagline.selected ? <Check className="size-3.5" aria-hidden /> : null}
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {valueProp ? (
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá trị cốt lõi</p>
                <h3 className="mt-2 text-xl font-bold">{valueProp.headline}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{valueProp.subheadline}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {valueProp.pillars?.map((p, i) => (
                    <div key={`${p.title}-${i}`} className="rounded-xl bg-muted/40 p-4">
                      <span className="text-xs font-bold text-primary">0{i + 1}</span>
                      <p className="mt-1 font-semibold">{p.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {persona ? (
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chân dung khách hàng</p>
                    <p className="font-semibold">
                      {persona.name} · {persona.age_range} tuổi
                    </p>
                    <p className="text-xs text-muted-foreground">{persona.occupation}</p>
                  </div>
                </div>
                {persona.quote ? <p className="mt-4 rounded-xl bg-muted/40 p-4 text-sm italic">{persona.quote}</p> : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-success">Mục tiêu</p>
                    <ul className="mt-1.5 space-y-1 text-sm">
                      {persona.goals?.map((g, idx) => (
                        <li key={`${g}-${idx}`} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive">Nỗi đau</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                      {persona.pains?.map((p, idx) => (
                        <li key={`${p}-${idx}`}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              {palette ? (
                <div className="rounded-2xl border bg-card p-6 shadow-xs">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bảng màu · {String(palette.label ?? "")}</p>
                  <PaletteSwatches palette={palette} className="mt-4 sm:grid-cols-3" />
                </div>
              ) : null}
              {typography ? (
                <div className="rounded-2xl border bg-card p-6 shadow-xs">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Typography</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                      <span className="text-3xl font-bold" style={{ fontFamily: typography.heading }}>Aa</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Tiêu đề</p>
                        <p className="font-semibold">{typography.heading}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                      <span className="text-3xl" style={{ fontFamily: typography.body }}>Aa</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Nội dung</p>
                        <p className="font-semibold">{typography.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </KitSection>

          {/* DỊCH VỤ */}
          <KitSection id="services" eyebrow="02 · Dịch vụ" title={`${services.length} dịch vụ được đóng gói`} description="Từ sản phẩm bạn nhập, hệ thống viết mô tả, phạm vi, thời gian bàn giao và gợi ý bán thêm.">
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((s, idx) => (
                <div key={`${s.name}-${idx}`} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{s.name}</h3>
                    <div className="text-right">
                      <p className="font-bold">{formatVND(s.sale_price ?? s.price)}</p>
                      {s.sale_price ? <s className="text-xs text-muted-foreground">{formatVND(s.price)}</s> : null}
                      <p className="text-[11px] text-muted-foreground">/ {s.unit}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {s.features.slice(0, 3).map((f, idx) => (
                      <li key={`${f}-${idx}`} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden /> Bàn giao: {s.delivery_time}
                  </p>
                </div>
              ))}
            </div>
          </KitSection>

          {/* BẢNG GIÁ */}
          <KitSection id="pricing" eyebrow="03 · Bảng giá" title="3 gói giá với gói mỏ neo" description="Gói Tiêu chuẩn được làm nổi bật; gói Cao cấp tồn tại để gói Tiêu chuẩn trông hợp lý.">
            <div className="grid gap-4 md:grid-cols-3">
              {pricing.packages.map((p, idx) => (
                <div key={p.tier} className={cn("relative flex flex-col rounded-2xl border bg-card p-5 shadow-xs", p.recommended && "border-primary ring-2 ring-primary/20")}>
                  {p.recommended ? <Badge className="absolute -top-3 left-5">Khuyến nghị</Badge> : null}
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 min-h-10 text-xs text-muted-foreground">{p.description}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight">{formatVND(p.price)}</p>
                  <p className="text-xs text-muted-foreground">/ {p.billing_unit}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {p.features.map((f, idx) => (
                      <li key={`${f}-${idx}`} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <LockedNote>Bản đầy đủ có thêm khuyến nghị định giá & máy tính biên lợi nhuận</LockedNote>
          </KitSection>

          {/* BÁN HÀNG */}
          <KitSection id="sales" eyebrow="04 · Bán hàng" title="Nói gì để khách gật đầu" description="Elevator pitch, tin nhắn, kịch bản tư vấn 6 bước, xử lý từ chối, follow-up và câu chốt.">
            {pitch?.text ? (
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Elevator pitch</p>
                  {pitch.duration ? <Badge variant="outline">{pitch.duration}</Badge> : null}
                </div>
                <p className="mt-3 leading-relaxed">{pitch.text}</p>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {objections.map((o, idx) => (
                <div key={`${o.objection}-${idx}`} className="rounded-2xl border bg-card p-5 shadow-xs">
                  <p className="flex items-start gap-2 text-sm font-semibold">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden /> “{o.objection}”
                  </p>
                  <p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm leading-relaxed">{o.response}</p>
                </div>
              ))}
            </div>
            <LockedNote>Bản đầy đủ: 6 tình huống từ chối, kịch bản tư vấn 6 bước, chuỗi follow-up 30 ngày</LockedNote>
          </KitSection>

          {/* MARKETING */}
          <KitSection id="marketing" eyebrow="05 · Marketing" title="Kế hoạch 30 ngày, bắt đầu từ ngày mai" description="Tổng quan chiến lược, kênh ưu tiên và việc cần làm từng ngày.">
            {overview ? (
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <p className="leading-relaxed">{overview.summary}</p>
                {overview.goals?.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {overview.goals.map((g, idx) => (
                      <li key={`${g}-${idx}`} className="flex gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {g}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            <div>
              <h3 className="text-sm font-semibold">Tuần đầu tiên</h3>
              <ol className="mt-3 space-y-2">
                {planDays.map((d) => (
                  <li key={d.day_index} className="flex gap-4 rounded-xl border bg-card p-4">
                    <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-[10px] leading-none">Ngày</span>
                      <span className="text-base font-bold leading-tight">{d.day_index}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{d.title}</p>
                        <Badge variant={KIND_VARIANT[d.kind] ?? "secondary"}>{KIND_LABEL[d.kind] ?? d.kind}</Badge>
                        <span className="text-xs text-muted-foreground">{d.channel}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <LockedNote>Bản đầy đủ: 30 ngày, chiến lược ra mắt 4 giai đoạn, ý tưởng chiến dịch, khuyến mãi & lead magnet</LockedNote>
          </KitSection>

          {/* NỘI DUNG */}
          <KitSection id="content" eyebrow="06 · Nội dung" title="30 bài đăng, đây là 5 bài đầu" description="Mỗi bài có hook, caption và CTA, chia theo nền tảng bạn chọn.">
            <div className="grid gap-4 sm:grid-cols-2">
              {contentItems.map((c) => (
                <article key={c.day_offset} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{PLATFORM_LABEL[c.platform] ?? c.platform}</Badge>
                    <span className="text-xs text-muted-foreground">{c.content_type} · Ngày {c.day_offset}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{c.hook}</h3>
                  <p className="mt-2 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{c.caption}</p>
                  <p className="mt-3 text-xs font-medium text-primary">CTA: {c.cta}</p>
                </article>
              ))}
            </div>
            <LockedNote>Bản đầy đủ: 30 bài, lịch đăng theo ngày, đổi trạng thái ý tưởng → nháp → sẵn sàng</LockedNote>
          </KitSection>

          {/* WEBSITE */}
          <KitSection id="website" eyebrow="07 · Website Kit" title="Landing page 12 section" description="Nội dung viết sẵn cho mọi section, theme theo bảng màu thương hiệu. Đây là phần hero.">
            {hero ? (
              <div className="overflow-hidden rounded-2xl border shadow-md">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 h-5 flex-1 rounded-md bg-background px-2 text-[10px] leading-5 text-muted-foreground">launchkit.vn/site/{kit.slug}</span>
                </div>
                <div className="px-6 py-12 text-center sm:px-12 sm:py-16" style={{ backgroundColor: website.theme.bg, color: "#0F172A", fontFamily: website.theme.font }}>
                  {hero.badge ? <span className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: website.theme.secondary }}>{hero.badge}</span> : null}
                  {hero.eyebrow ? <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: website.theme.primary }}>{hero.eyebrow}</p> : null}
                  <h3 className="mx-auto mt-2 max-w-2xl text-balance text-2xl font-bold sm:text-4xl">{hero.title}</h3>
                  <p className="mx-auto mt-3 max-w-xl text-balance text-sm opacity-80 sm:text-base">{hero.subtitle}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow" style={{ backgroundColor: website.theme.primary, borderRadius: website.theme.radius }}>{hero.cta_label}</span>
                    <span className="rounded-lg border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: website.theme.primary, color: website.theme.primary, borderRadius: website.theme.radius }}>{hero.secondary_label}</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {website.sections.map((s, idx) => (
                <Badge key={s.id} variant="outline" className="capitalize">{s.type.replace("_", " ")}</Badge>
              ))}
            </div>
            <LockedNote>Website Kit (gói Pro): studio kéo thả, xuất bản trang public, xuất HTML</LockedNote>
          </KitSection>
        </div>

        {/* Sidebar CTA (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Đến lượt bạn</p>
              <h3 className="mt-2 text-lg font-bold">Tạo kit cho business của bạn</h3>
              <p className="mt-2 text-sm text-muted-foreground">Trả lời 11 câu hỏi như ví dụ này và nhận bản xem trước miễn phí trong 10 phút.</p>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link href={onboardingHref}>
                  Tạo kit cho business của bạn <ArrowRight />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Miễn phí · Không cần thẻ</p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-5 text-sm">
              <p className="mb-3 flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-primary" aria-hidden /> Câu trả lời của ví dụ này
              </p>
              <dl className="space-y-2.5">
                <div>
                  <dt className="text-xs text-muted-foreground">Chủ</dt>
                  <dd className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(kit.answers.ownerName)}</span>
                    {kit.answers.ownerName} · {kit.answers.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sản phẩm</dt>
                  <dd>{kit.answers.products.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Tính cách thương hiệu</dt>
                  <dd>{personalities.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Kênh bán</dt>
                  <dd>{channels.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Mục tiêu doanh thu</dt>
                  <dd className="font-medium">{formatVND(kit.answers.revenueTarget)} / tháng</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {/* CTA cố định (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="container-x flex items-center gap-3">
          <p className="hidden flex-1 text-sm sm:block">Thích ví dụ này? Tạo kit cho business của bạn.</p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={onboardingHref}>
              Tạo kit cho business của bạn <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
