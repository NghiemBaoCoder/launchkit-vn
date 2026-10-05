import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Clock, MessageSquareText, PenLine, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import { formatVND } from "@/lib/utils";
import { getBusinessTypes, getProducts } from "@/lib/data/catalog";
import { Section, SectionHeading, CtaBanner } from "@/components/site/section";
import { HeroPreview } from "@/components/site/hero-preview";
import { KIT_MODULES } from "@/components/site/kit-modules";
import { CatalogIcon } from "@/components/site/catalog-icon";
import { TestimonialGrid, pickTestimonials } from "@/components/site/testimonials";
import { FaqList } from "@/components/site/faq-list";
import { HOME_FAQ } from "@/components/site/faq-data";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — Tạo Business Kit hoàn chỉnh trong 10 phút` },
  description: SITE.description,
};

const STEPS = [
  { icon: MessageSquareText, title: "Trả lời 11 câu hỏi", time: "≈ 5 phút", description: "Loại hình, ngành, khách hàng mục tiêu, sản phẩm, tính cách thương hiệu, kênh bán và mục tiêu doanh thu. Không cần chuẩn bị gì trước." },
  { icon: WandSparkles, title: "Hệ thống tạo kit 11 phần", time: "≈ 3 phút", description: "Từ phân tích business đến thương hiệu, bảng giá, kịch bản bán hàng, marketing 30 ngày, 30 nội dung, website, tài chính, vận hành và tài liệu." },
  { icon: PenLine, title: "Chỉnh sửa, xuất & chia sẻ", time: "Bất cứ lúc nào", description: "Sửa trực tiếp trong workspace, tạo lại từng phần, xuất PDF / CSV / Markdown, chia sẻ link cho cộng sự hoặc xuất bản website." },
];

const TEASER_SLUGS = ["business-kit", "business-kit-pro", "pro-membership"] as const;

function featuresOf(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

export default async function HomePage() {
  const [businessTypes, products] = await Promise.all([getBusinessTypes(), getProducts()]);
  const teaser = TEASER_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      {/* Hero */}
      <section className="surface-glow relative overflow-hidden border-b">
        <div className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="max-w-xl animate-slide-up">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="size-3.5 text-primary" /> 8 loại hình · 38 ngành · 100% tiếng Việt
            </Badge>
            <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Bộ khởi nghiệp hoàn chỉnh cho business của bạn — <span className="gradient-text">trong 10 phút</span>
            </h1>
            <p className="mt-5 text-balance text-lg text-muted-foreground">
              Trả lời 11 câu hỏi, nhận ngay thương hiệu, bảng giá, kịch bản bán hàng, kế hoạch marketing 30 ngày, 30 nội dung, website và bộ tài liệu — viết riêng cho freelancer, creator, salon, shop online và agency tại Việt Nam.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="xl">
                <Link href="/onboarding">
                  Tạo Business Kit <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/examples">Xem ví dụ thật</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {["Miễn phí để bắt đầu", "Không cần thẻ", "Chỉnh sửa không giới hạn"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-xl animate-slide-up lg:max-w-none" style={{ animationDelay: "150ms" }}>
            <HeroPreview />
          </div>
        </div>
        <div className="border-t bg-background/60">
          <dl className="container-x grid grid-cols-2 gap-6 py-6 text-center sm:grid-cols-4">
            {[
              ["10 phút", "từ câu hỏi đến kit"],
              ["10 phần", "trong một Business Kit"],
              ["30 nội dung", "đa nền tảng, sẵn sàng đăng"],
              ["6 tài liệu", "báo giá, hợp đồng, hoá đơn…"],
            ].map(([v, l]) => (
              <div key={v}>
                <dt className="text-2xl font-bold tracking-tight sm:text-3xl">{v}</dt>
                <dd className="text-xs text-muted-foreground sm:text-sm">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bạn nhận được gì */}
      <Section id="what-you-get">
        <div className="container-x">
          <SectionHeading eyebrow="Bạn nhận được gì" title="Một Business Kit, đủ mọi thứ để bắt đầu bán" description="Không phải một tài liệu chung chung — là 10 phần nối với nhau, viết từ chính câu trả lời của bạn." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {KIT_MODULES.map((m, i) => (
              <div key={m.key} className="group flex flex-col rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <m.icon className="size-5" aria-hidden />
                  </span>
                  <Badge variant="outline" className="text-[10px]">{m.count}</Badge>
                </div>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Cách hoạt động */}
      <Section className="border-y bg-muted/30" id="how-it-works">
        <div className="container-x">
          <SectionHeading eyebrow="Cách hoạt động" title="3 bước, không cần kinh nghiệm marketing" description="Bạn chỉ cần biết mình bán gì và cho ai. Phần còn lại LaunchKit lo." />
          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-md">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-5xl font-black text-muted-foreground/15">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Clock className="size-3.5" aria-hidden /> {s.time}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost">
              <Link href="/how-it-works">
                Xem chi tiết 11 bước tạo nội dung <ChevronRight />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Loại hình */}
      <Section id="business-types">
        <div className="container-x">
          <SectionHeading eyebrow="Theo loại hình" title="Viết riêng cho cách bạn kinh doanh" description="Freelancer báo giá theo dự án, salon cần kín lịch, shop online cần chốt inbox — mỗi loại hình có bộ nội dung, bảng giá và quy trình riêng." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businessTypes.map((bt) => (
              <Link key={bt.id} href={`/business-kit/${bt.slug}`} className="group flex flex-col rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <CatalogIcon name={bt.icon} className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{bt.name}</h3>
                {bt.tagline ? <p className="text-xs font-medium text-primary">{bt.tagline}</p> : null}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{bt.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Xem kit mẫu <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="border-y bg-muted/30" id="testimonials">
        <div className="container-x">
          <SectionHeading eyebrow="Khách hàng nói gì" title="Những người đã bắt đầu đúng cách" description="Từ freelancer đến chủ quán cà phê — họ dùng Business Kit để báo giá tự tin hơn, đăng bài đều hơn và chốt khách tốt hơn." />
          <TestimonialGrid items={pickTestimonials(undefined, 3)} className="mt-12" />
        </div>
      </Section>

      {/* Bảng giá */}
      <Section id="pricing">
        <div className="container-x">
          <SectionHeading eyebrow="Bảng giá" title="Trả một lần, dùng mãi mãi" description="Bắt đầu miễn phí với bản xem trước. Mở khoá toàn bộ kit khi bạn đã thấy hợp." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {teaser.map((p) => {
              const current = p.sale_price ?? p.price;
              const feats = featuresOf(p.features).slice(0, 4);
              return (
                <div key={p.id} className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-xs ${p.recommended ? "border-primary ring-2 ring-primary/20" : ""}`}>
                  {p.recommended ? <Badge className="absolute -top-3 left-6">Khuyến nghị</Badge> : null}
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
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hoàn tiền trong 7 ngày nếu chưa xuất tài liệu.{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              So sánh đầy đủ các gói →
            </Link>
          </p>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="border-t bg-muted/30" id="faq">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading align="left" eyebrow="Câu hỏi thường gặp" title="Vẫn còn băn khoăn?" description="Những câu được hỏi nhiều nhất về Business Kit, thanh toán và hoàn tiền." />
            <Button asChild variant="outline" className="mt-6">
              <Link href="/faq">
                Xem tất cả câu hỏi <ChevronRight />
              </Link>
            </Button>
          </div>
          <FaqList items={HOME_FAQ} idPrefix="home-faq" />
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="container-x">
          <CtaBanner
            title="Sẵn sàng có Business Kit của riêng bạn?"
            description="10 phút hôm nay thay cho 10 tuần loay hoay. Bắt đầu miễn phí, không cần thẻ."
            secondaryHref="/examples"
            secondaryLabel="Xem ví dụ trước"
            note="Đã có tài khoản? Đăng nhập để tiếp tục kit đang làm dở."
          />
        </div>
      </Section>
    </>
  );
}
