import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock, Download, Globe, MessageSquareText, PenLine, Share2, Smartphone, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import { formatVND } from "@/lib/utils";
import { getBusinessTypes, getIndustries, getProducts } from "@/lib/data/catalog";
import { COLOR_PALETTES } from "@/lib/onboarding/schema";
import { Section, SectionHeading, CtaBanner } from "@/components/site/section";
import { HeroVisual } from "@/components/site/hero-visual";
import { KIT_MODULES } from "@/components/site/kit-modules";
import { CatalogIcon } from "@/components/site/catalog-icon";
import { KitCover } from "@/components/site/kit-cover";
import { BrowserFrame, PhoneFrame } from "@/components/site/device-mockup";
import { QuestionsIllustration, KitStackIllustration, DocumentsIllustration } from "@/components/site/illustrations";
import { TestimonialCard, TestimonialNote, pickTestimonials } from "@/components/site/testimonials";
import { FaqList } from "@/components/site/faq-list";
import { HOME_FAQ } from "@/components/site/faq-data";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RotatingWords } from "@/components/motion/rotating-words";
import { TiltCard } from "@/components/motion/tilt-card";
import { Marquee } from "@/components/motion/marquee";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — Tạo Business Kit hoàn chỉnh trong 10 phút` },
  description: SITE.description,
};

/** ISR: trang public được cache và làm mới mỗi 600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 600;

const HERO_WORDS = ["freelancer", "creator", "salon & spa", "shop online", "agency", "quán cà phê", "coach", "dịch vụ tại nhà"];

const STEPS = [
  { icon: MessageSquareText, title: "Trả lời 11 câu hỏi", time: "≈ 5 phút", description: "Loại hình, ngành, khách hàng mục tiêu, sản phẩm, tính cách thương hiệu, kênh bán và mục tiêu doanh thu. Không cần chuẩn bị gì trước.", Illustration: QuestionsIllustration },
  { icon: WandSparkles, title: "Hệ thống tạo kit 11 phần", time: "≈ 3 phút", description: "Từ phân tích business đến thương hiệu, bảng giá, kịch bản bán hàng, marketing 30 ngày, 30 nội dung, website, tài chính, vận hành và tài liệu.", Illustration: KitStackIllustration },
  { icon: PenLine, title: "Chỉnh sửa, xuất & chia sẻ", time: "Bất cứ lúc nào", description: "Sửa trực tiếp trong workspace, tạo lại từng phần, xuất PDF / CSV / Markdown, chia sẻ link cho cộng sự hoặc xuất bản website.", Illustration: DocumentsIllustration },
];

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 10, suffix: " phút", label: "từ câu hỏi đến kit" },
  { value: 10, suffix: " phần", label: "trong một Business Kit" },
  { value: 30, suffix: " nội dung", label: "đa nền tảng, sẵn sàng đăng" },
  { value: 6, suffix: " tài liệu", label: "báo giá, hợp đồng, hoá đơn…" },
];

const MODULE_TONES = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-red-500",
  "from-blue-500 to-indigo-500",
  "from-lime-500 to-emerald-500",
  "from-purple-500 to-violet-500",
  "from-orange-500 to-amber-500",
];

const TEASER_SLUGS = ["business-kit", "business-kit-pro", "pro-membership"] as const;

function featuresOf(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

function paletteFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return COLOR_PALETTES[h % COLOR_PALETTES.length];
}

/** Mini landing page để minh hoạ Website Kit bên trong khung thiết bị. */
function MiniSite({ compact = false }: { compact?: boolean }) {
  const p = COLOR_PALETTES[2];
  const pad = compact ? "px-4" : "px-8";
  return (
    <div className="bg-white text-zinc-900" style={{ fontSize: compact ? 10 : 11 }}>
      <div className={`${pad} flex items-center justify-between py-3`}>
        <span className="font-bold" style={{ color: p.primary }}>Nail House</span>
        <span className="rounded-full px-3 py-1 font-semibold text-white" style={{ background: p.primary }}>Đặt lịch</span>
      </div>
      <div className={`${pad} py-6`} style={{ background: p.bg }}>
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: `${p.primary}22`, color: p.primary }}>Quận 7 · Mở cửa 9:00–21:00</span>
        <p className="mt-3 text-lg font-extrabold leading-tight" style={{ fontSize: compact ? 18 : 22 }}>Bộ nail xinh, bền 3 tuần, không hại móng</p>
        <p className="mt-2 text-zinc-600">Gel Hàn Quốc, kỹ thuật viên 3+ năm kinh nghiệm. Ưu đãi 20% cho lần đầu.</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-lg px-3 py-1.5 font-semibold text-white" style={{ background: p.primary }}>Đặt lịch ngay</span>
          <span className="rounded-lg border px-3 py-1.5 font-semibold">Xem bảng giá</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {["#f9a8d4", "#fbcfe8", "#fda4af"].map((c, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg" style={{ background: `linear-gradient(135deg, ${c}, ${p.secondary})` }} />
          ))}
        </div>
      </div>
      <div className={`${pad} py-6`}>
        <p className="font-bold" style={{ fontSize: compact ? 13 : 15 }}>Dịch vụ nổi bật</p>
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
          {[["Sơn gel", "150k"], ["Đắp bột / Úp móng", "350k"], ["Nail art theo yêu cầu", "từ 50k"], ["Combo cô dâu", "890k"]].map(([n, pr]) => (
            <div key={n} className="flex items-center justify-between rounded-lg border p-2.5">
              <span className="font-medium">{n}</span>
              <span className="font-bold" style={{ color: p.primary }}>{pr}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${pad} py-6`} style={{ background: p.bg }}>
        <p className="font-bold" style={{ fontSize: compact ? 13 : 15 }}>Bảng giá combo</p>
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
          {[["Cơ bản", "199k"], ["Tiêu chuẩn", "349k"], ["Cao cấp", "549k"]].map(([n, pr], i) => (
            <div key={n} className={`rounded-xl border bg-white p-3 ${i === 1 ? "ring-2" : ""}`} style={i === 1 ? { borderColor: p.primary, ["--tw-ring-color" as string]: `${p.primary}33` } : undefined}>
              <p className="font-semibold">{n}</p>
              <p className="mt-1 text-base font-extrabold" style={{ color: p.primary }}>{pr}</p>
              <ul className="mt-2 space-y-1 text-zinc-600">
                <li>✓ Sơn gel + dưỡng</li>
                <li>✓ Bảo hành 7 ngày</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className={`${pad} py-6`}>
        <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}>
          <p className="font-bold" style={{ fontSize: compact ? 13 : 15 }}>Đặt lịch hôm nay, giảm 20%</p>
          <p className="mt-1 opacity-90">Nhắn Zalo hoặc để lại số điện thoại, tiệm gọi lại trong 10 phút.</p>
          <span className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 font-semibold" style={{ color: p.primary }}>Nhận ưu đãi</span>
        </div>
        <p className="mt-6 text-center text-zinc-400">© Nail House · Tạo bằng LaunchKit VN</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [businessTypes, industries, products] = await Promise.all([getBusinessTypes(), getIndustries(), getProducts()]);
  const teaser = TEASER_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const typeIconById = new Map(businessTypes.map((t) => [t.id, t.icon]));
  const industryRowA = industries.filter((_, i) => i % 2 === 0);
  const industryRowB = industries.filter((_, i) => i % 2 === 1);
  const typeCount = businessTypes.length || 8;
  const industryCount = industries.length || 38;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
          <div className="absolute -left-32 -top-32 size-[34rem] rounded-full bg-primary/15 blur-3xl animate-aurora" />
          <div className="absolute -right-24 top-20 size-[28rem] rounded-full bg-fuchsia-400/15 blur-3xl animate-aurora [animation-delay:-7s]" />
        </div>
        <div className="container-x grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="max-w-xl">
            <Reveal immediate direction="down" delay={0.05}>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="size-3.5 text-primary" aria-hidden /> {typeCount} loại hình · {industryCount} ngành · 100% tiếng Việt
              </Badge>
            </Reveal>
            <Reveal immediate delay={0.12}>
              <h1 className="text-hero mt-5 font-extrabold text-balance">
                Bộ khởi nghiệp hoàn chỉnh cho <RotatingWords words={HERO_WORDS} wordClassName="gradient-text" /> — <span className="whitespace-nowrap">trong 10 phút</span>
              </h1>
            </Reveal>
            <Reveal immediate delay={0.2}>
              <p className="mt-5 text-balance text-base text-muted-foreground sm:text-lg">
                Trả lời 11 câu hỏi, nhận ngay thương hiệu, bảng giá, kịch bản bán hàng, kế hoạch marketing 30 ngày, 30 nội dung, website và bộ tài liệu — viết riêng cho cách bạn kinh doanh tại Việt Nam.
              </p>
            </Reveal>
            <Reveal immediate delay={0.28}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild size="xl" className="shine relative overflow-hidden shadow-lg shadow-primary/25">
                  <Link href="/onboarding">
                    Tạo Business Kit miễn phí <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link href="/examples">Xem 6 ví dụ thật</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal immediate delay={0.36}>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {["Miễn phí để bắt đầu", "Không cần thẻ", "Chỉnh sửa không giới hạn"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-success" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="mx-auto w-full max-w-xl pt-6 sm:pt-10 lg:max-w-none lg:pt-0">
            <HeroVisual />
          </div>
        </div>

        {/* Số liệu */}
        <div className="relative border-t bg-background/70 backdrop-blur">
          <dl className="container-x grid grid-cols-2 gap-6 py-7 text-center sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} immediate delay={0.5 + i * 0.08} direction="up">
                <dt className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </dt>
                <dd className="text-xs text-muted-foreground sm:text-sm">{s.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Ngành (marquee) ---------- */}
      {industries.length > 0 ? (
        <section className="border-b bg-muted/30 py-8" aria-label="Các ngành được hỗ trợ">
          <div className="container-x mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Nội dung được viết riêng cho <span className="font-semibold text-foreground">{industryCount} ngành</span> phổ biến tại Việt Nam
            </p>
            <Link href="/onboarding" className="text-sm font-medium text-primary hover:underline">Không thấy ngành của bạn? Mô tả tự do →</Link>
          </div>
          <div className="space-y-3">
            {[industryRowA, industryRowB].map((row, ri) => (
              <Marquee key={ri} speed={ri === 0 ? 55 : 65} reverse={ri === 1}>
                {row.map((ind) => (
                  <span key={ind.id} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border bg-card px-3.5 py-1.5 text-sm shadow-xs">
                    <CatalogIcon name={typeIconById.get(ind.business_type_id ?? "") ?? "Briefcase"} className="size-4 text-primary" />
                    {ind.name}
                  </span>
                ))}
              </Marquee>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- Bạn nhận được gì ---------- */}
      <Section id="what-you-get">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Bạn nhận được gì" title="Một Business Kit, đủ mọi thứ để bắt đầu bán" description="Không phải một tài liệu chung chung — là 10 phần nối với nhau, viết từ chính câu trả lời của bạn." />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" gap={0.06}>
            {KIT_MODULES.map((mod, i) => (
              <StaggerItem key={mod.key} className="group">
                <TiltCard className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${MODULE_TONES[i % MODULE_TONES.length]}`}>
                      <mod.icon className="size-5" aria-hidden />
                    </span>
                    <Badge variant="outline" className="text-[10px]">{mod.count}</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold">{mod.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* ---------- Cách hoạt động ---------- */}
      <Section className="relative overflow-hidden border-y bg-muted/30" id="how-it-works">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="container-x relative">
          <Reveal>
            <SectionHeading eyebrow="Cách hoạt động" title="3 bước, không cần kinh nghiệm marketing" description="Bạn chỉ cần biết mình bán gì và cho ai. Phần còn lại LaunchKit lo." />
          </Reveal>
          <ol className="mt-14 space-y-14 lg:space-y-20">
            {STEPS.map((s, i) => {
              const flip = i % 2 === 1;
              return (
                <li key={s.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <Reveal direction={flip ? "left" : "right"} className={flip ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lg shadow-primary/25">
                        <s.icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-6xl font-black text-primary/10">0{i + 1}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      <Clock className="size-4" aria-hidden /> {s.time}
                    </p>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">{s.description}</p>
                  </Reveal>
                  <Reveal direction="scale" delay={0.1} className={flip ? "lg:order-1" : ""}>
                    <div className="relative mx-auto max-w-md">
                      <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/15 via-transparent to-fuchsia-400/15 blur-2xl" />
                      <div className="relative rounded-3xl border bg-card/80 p-4 shadow-xl backdrop-blur animate-float-slow" style={{ animationDelay: `${i * -2}s` }}>
                        <s.Illustration />
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
          <Reveal className="mt-12 text-center">
            <Button asChild variant="ghost">
              <Link href="/how-it-works">
                Xem chi tiết 11 bước tạo nội dung <ChevronRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Website Kit ---------- */}
      <Section id="website-kit">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal direction="right">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Website Kit</p>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Landing page 12 section, viết sẵn nội dung — đẹp trên mọi màn hình</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">Theme màu theo thương hiệu, nội dung lấy từ chính kit của bạn. Chỉnh trong studio, bật công khai là có trang để chạy quảng cáo.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Globe, text: "Trang public tại launchkit.vn/site/ten-business" },
                { icon: Smartphone, text: "Responsive, tải nhanh, tối ưu cho Zalo / Facebook in-app browser" },
                { icon: Share2, text: "Chia sẻ link cho cộng sự, bật / tắt từng section" },
                { icon: Download, text: "Xuất nội dung để đưa lên WordPress, Haravan, Ladipage…" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="size-3.5" aria-hidden />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7" variant="outline">
              <Link href="/examples/nail-house-quan-7">Xem website kit mẫu <ArrowRight /></Link>
            </Button>
          </Reveal>
          <Reveal direction="scale" delay={0.1}>
            <div className="relative mx-auto flex max-w-2xl items-end justify-center gap-6 sm:gap-10">
              <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 via-fuchsia-400/10 to-amber-300/20 blur-3xl" />
              <BrowserFrame url="launchkit.vn/site/nail-house-quan-7" autoScroll viewportHeight={380} className="relative hidden w-full sm:block">
                <MiniSite />
              </BrowserFrame>
              <PhoneFrame autoScroll viewportHeight={440} className="relative shrink-0 sm:-ml-24 sm:mb-[-24px] sm:w-[200px] sm:shadow-2xl">
                <MiniSite compact />
              </PhoneFrame>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Loại hình ---------- */}
      <Section className="border-y bg-muted/30" id="business-types">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Theo loại hình" title="Viết riêng cho cách bạn kinh doanh" description="Freelancer báo giá theo dự án, salon cần kín lịch, shop online cần chốt inbox — mỗi loại hình có bộ nội dung, bảng giá và quy trình riêng." />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.07}>
            {businessTypes.map((bt) => {
              const pal = paletteFor(bt.slug);
              return (
                <StaggerItem key={bt.id}>
                  <Link href={`/business-kit/${bt.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <KitCover name={bt.name} palette={pal} icon={bt.icon} seed={bt.slug} className="h-28 transition-transform duration-500 group-hover:scale-[1.02]">
                      {bt.tagline ? <span className="absolute bottom-3 left-4 right-4 truncate text-xs font-medium text-white/90">{bt.tagline}</span> : null}
                    </KitCover>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold">{bt.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{bt.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Xem kit mẫu <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Section>

      {/* ---------- Testimonials ---------- */}
      <Section id="testimonials">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Khách hàng nói gì" title="Những người đã bắt đầu đúng cách" description="Từ freelancer đến chủ quán cà phê — họ dùng Business Kit để báo giá tự tin hơn, đăng bài đều hơn và chốt khách tốt hơn." />
          </Reveal>
          <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
            {pickTestimonials(undefined, 3).map((t, i) => (
              <StaggerItem key={t.name}>
                <TestimonialCard item={t} index={i} className="transition-shadow hover:shadow-lg" />
              </StaggerItem>
            ))}
          </Stagger>
          <TestimonialNote className="mt-6" />
        </div>
      </Section>

      {/* ---------- Bảng giá ---------- */}
      <Section className="border-y bg-muted/30" id="pricing">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Bảng giá" title="Trả một lần, dùng mãi mãi" description="Bắt đầu miễn phí với bản xem trước. Mở khoá toàn bộ kit khi bạn đã thấy hợp." />
          </Reveal>
          <Stagger className="mt-12 grid gap-5 lg:grid-cols-3" gap={0.1}>
            {teaser.map((p) => {
              const current = p.sale_price ?? p.price;
              const feats = featuresOf(p.features).slice(0, 4);
              return (
                <StaggerItem key={p.id} direction="scale">
                  <div className={`relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-lg ${p.recommended ? "border-primary ring-2 ring-primary/20" : ""}`}>
                    {p.recommended ? <Badge className="absolute -top-3 left-6 shadow">Khuyến nghị</Badge> : null}
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-4 flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">{formatVND(current)}</span>
                      {p.billing_interval === "month" ? <span className="text-sm text-muted-foreground">/ tháng</span> : null}
                      {p.sale_price ? <s className="text-sm text-muted-foreground">{formatVND(p.price)}</s> : null}
                    </div>
                    <ul className="mt-5 space-y-2 text-sm">
                      {feats.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={p.recommended ? "default" : "outline"} className="mt-6">
                      <Link href="/pricing">Xem chi tiết gói</Link>
                    </Button>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Reveal className="mt-6 text-center text-sm text-muted-foreground">Hoàn tiền trong 7 ngày nếu bạn chưa xuất tài liệu nào. Nhập <strong>DEMO50</strong> để giảm 50% (bản demo).</Reveal>
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section id="faq">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal direction="right">
            <SectionHeading align="left" eyebrow="Câu hỏi thường gặp" title="Trước khi bắt đầu" description="Chưa thấy câu trả lời? Xem toàn bộ FAQ hoặc nhắn cho chúng tôi." />
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href="/faq">Toàn bộ FAQ</Link></Button>
              <Button asChild variant="ghost"><Link href="/contact">Liên hệ</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <FaqList items={HOME_FAQ.slice(0, 6)} />
          </Reveal>
        </div>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section className="pt-0">
        <div className="container-x">
          <Reveal direction="scale">
            <CtaBanner title="Sẵn sàng bắt đầu đúng cách?" description="11 câu hỏi, 10 phút, một Business Kit hoàn chỉnh. Miễn phí để bắt đầu — không cần thẻ." secondaryHref="/examples" secondaryLabel="Xem ví dụ trước" note="Đã có hơn 6 kit mẫu cho freelancer, creator, salon, shop online, agency và F&B." />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
