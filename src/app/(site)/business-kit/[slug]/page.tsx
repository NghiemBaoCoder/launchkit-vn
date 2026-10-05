import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, CircleX, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBusinessTypeBySlug, getBusinessTypes, getIndustries } from "@/lib/data/catalog";
import { getExampleBySlug } from "@/lib/examples";
import { CatalogIcon } from "@/components/site/catalog-icon";
import { Section, SectionHeading, CtaBanner } from "@/components/site/section";
import { KIT_MODULES } from "@/components/site/kit-modules";
import { getTypeDetail } from "@/components/site/business-type-data";
import { TestimonialGrid, pickTestimonials } from "@/components/site/testimonials";
import { FaqList } from "@/components/site/faq-list";
import { HOME_FAQ } from "@/components/site/faq-data";

type Params = { params: Promise<{ slug: string }> };

function stringList(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

function seoOf(json: unknown): { title?: string; description?: string } {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return {};
  const o = json as Record<string, unknown>;
  return { title: typeof o.title === "string" ? o.title : undefined, description: typeof o.description === "string" ? o.description : undefined };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const bt = await getBusinessTypeBySlug(slug);
  if (!bt) return { title: "Không tìm thấy loại hình" };
  const seo = seoOf(bt.seo);
  const title = seo.title ?? bt.hero_title ?? `Business Kit cho ${bt.name}`;
  return {
    title: { absolute: title.includes("LaunchKit") ? title : `${title} | LaunchKit VN` },
    description: seo.description ?? bt.hero_description ?? bt.description ?? undefined,
  };
}

export default async function BusinessTypeLandingPage({ params }: Params) {
  const { slug } = await params;
  const bt = await getBusinessTypeBySlug(slug);
  if (!bt) notFound();
  const [industries, allTypes] = await Promise.all([getIndustries(), getBusinessTypes()]);
  const typeIndustries = industries.filter((i) => i.business_type_id === bt.id);
  const otherTypes = allTypes.filter((t) => t.id !== bt.id);
  const detail = getTypeDetail(bt.slug);
  const highlights = stringList(bt.highlights);
  const example = detail.exampleSlug ? getExampleBySlug(detail.exampleSlug) : undefined;
  const onboardingHref = `/onboarding?type=${bt.slug}`;
  const insideKeys = new Set(detail.inside.map((i) => i.moduleKey));
  const otherModules = KIT_MODULES.filter((m) => !insideKeys.has(m.key));

  return (
    <>
      {/* Hero */}
      <section className="surface-glow border-b">
        <div className="container-x grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <CatalogIcon name={bt.icon} className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Business Kit · {bt.name}</p>
                {bt.tagline ? <p className="text-sm font-medium text-muted-foreground">{bt.tagline}</p> : null}
              </div>
            </div>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{bt.hero_title ?? `Business Kit cho ${bt.name}`}</h1>
            <p className="mt-5 text-balance text-lg text-muted-foreground">{bt.hero_description ?? bt.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl">
                <Link href={onboardingHref}>
                  Tạo kit cho {bt.name} <ArrowRight />
                </Link>
              </Button>
              {example ? (
                <Button asChild size="xl" variant="outline">
                  <Link href={`/examples/${example.slug}`}>Xem ví dụ: {example.name}</Link>
                </Button>
              ) : (
                <Button asChild size="xl" variant="outline">
                  <Link href="/examples">Xem ví dụ</Link>
                </Button>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Dành cho {detail.audience}.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <div key={h} className="flex gap-3 rounded-2xl border bg-card/90 p-4 shadow-xs backdrop-blur animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
                  <Check className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-medium">{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ngành */}
      {typeIndustries.length ? (
        <Section className="py-12 sm:py-14">
          <div className="container-x">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{typeIndustries.length} ngành trong nhóm {bt.name}</h2>
                <p className="text-sm text-muted-foreground">Chọn ngành ở bước 2 khi tạo kit — nội dung, giá và kịch bản sẽ bám theo ngành đó.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {typeIndustries.map((ind) => (
                <Link key={ind.id} href={onboardingHref} className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                    <CatalogIcon name={ind.icon} className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{ind.name}</p>
                    {ind.description ? <p className="truncate text-xs text-muted-foreground">{ind.description}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Nỗi đau */}
      <Section className="border-y bg-muted/30">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <SectionHeading align="left" eyebrow="Nghe quen không?" title={`Những điều ${bt.name.toLowerCase()} hay gặp`} description="Không phải vì bạn thiếu năng lực — mà vì chưa có hệ thống. Business Kit cho bạn hệ thống đó trong 10 phút." />
          <ul className="space-y-3">
            {detail.painPoints.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-xs">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <CircleX className="size-4" aria-hidden />
                </span>
                <p className="font-medium">“{p}”</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Bên trong kit */}
      <Section id="inside">
        <div className="container-x">
          <SectionHeading eyebrow="Bên trong kit" title={`Business Kit cho ${bt.name} có gì`} description="10 phần nội dung, trong đó những phần sau được viết đặc biệt cho cách bạn kinh doanh." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {detail.inside.map((item, i) => {
              const mod = KIT_MODULES.find((m) => m.key === item.moduleKey);
              if (!mod) return null;
              return (
                <div key={item.moduleKey} className="flex flex-col rounded-2xl border bg-card p-6 shadow-xs animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <mod.icon className="size-5" aria-hidden />
                    </span>
                    <Badge variant="outline" className="text-[10px]">{mod.count}</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold">{mod.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              );
            })}
          </div>
          {otherModules.length ? (
            <div className="mt-6 rounded-2xl border border-dashed bg-muted/30 p-5">
              <p className="text-sm font-medium">Và đầy đủ các phần còn lại:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {otherModules.map((m) => (
                  <span key={m.key} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs">
                    <m.icon className="size-3.5 text-primary" aria-hidden /> {m.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Ví dụ */}
      {example ? (
        <Section className="border-y bg-muted/30">
          <div className="container-x">
            <div className="grid items-center gap-8 rounded-3xl border bg-card p-6 shadow-xs sm:p-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="size-4" aria-hidden /> Ví dụ thật cho {bt.name}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{example.name}</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">{example.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {example.tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>
              <Button asChild size="lg" variant="outline">
                <Link href={`/examples/${example.slug}`}>
                  Xem kit đầy đủ <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Testimonials */}
      <Section>
        <div className="container-x">
          <SectionHeading eyebrow="Khách hàng nói gì" title={`${bt.name} đã dùng LaunchKit`} />
          <TestimonialGrid items={pickTestimonials(bt.slug, 3)} className="mt-12" />
        </div>
      </Section>

      {/* FAQ + loại hình khác */}
      <Section className="border-t bg-muted/30">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading align="left" eyebrow="Câu hỏi thường gặp" title="Trước khi bắt đầu" />
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Loại hình khác</p>
              <div className="flex flex-wrap gap-2">
                {otherTypes.map((t) => (
                  <Link key={t.id} href={`/business-kit/${t.slug}`} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs hover:border-primary/40">
                    <CatalogIcon name={t.icon} className="size-3.5 text-primary" /> {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <FaqList items={HOME_FAQ} idPrefix={`bt-${bt.slug}-faq`} />
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <CtaBanner title={`Tạo Business Kit cho ${bt.name} ngay`} description={`${bt.tagline ?? "Bắt đầu đúng ngay từ đầu"}. Trả lời 11 câu hỏi, nhận bản xem trước miễn phí trong 10 phút.`} primaryHref={onboardingHref} primaryLabel={`Tạo kit cho ${bt.name}`} secondaryHref="/pricing" secondaryLabel="Xem bảng giá" />
        </div>
      </Section>
    </>
  );
}
