import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXAMPLE_KITS, getExampleKit, findAsset } from "@/lib/examples";
import { paletteByKey } from "@/lib/onboarding/schema";
import { CatalogIcon } from "@/components/site/catalog-icon";
import { PageIntro, Section, CtaBanner } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Ví dụ Business Kit",
  description: "6 Business Kit mẫu cho freelancer, creator, salon, shop online, agency và quán cà phê — xem thương hiệu, bảng giá, kịch bản bán hàng và nội dung được tạo ra như thế nào.",
};

const TYPE_ICON: Record<string, string> = {
  freelancer: "Laptop",
  creator: "Clapperboard",
  salon: "Scissors",
  "online-shop": "ShoppingBag",
  agency: "Building",
  fnb: "Coffee",
  coach: "GraduationCap",
  "local-service": "Wrench",
};

export default function ExamplesPage() {
  const kits = EXAMPLE_KITS.map((kit) => {
    const generated = getExampleKit(kit.slug);
    const tagline = generated ? (findAsset(generated.brand.assets, "tagline")?.content as { selected?: string } | undefined)?.selected : undefined;
    const palette = paletteByKey(kit.answers.colorPalette);
    return { kit, tagline, palette, serviceCount: generated?.services.length ?? 0 };
  });

  return (
    <>
      <PageIntro eyebrow="Ví dụ thật" title="6 Business Kit mẫu, 6 cách kinh doanh khác nhau" description="Mỗi ví dụ được tạo từ một bộ câu trả lời thật của một business giả định. Bấm vào để xem thương hiệu, bảng giá, kịch bản bán hàng, marketing, nội dung và website kit được sinh ra như thế nào." />
      <Section>
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {kits.map(({ kit, tagline, palette, serviceCount }, i) => (
              <Link key={kit.slug} href={`/examples/${kit.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 70%, ${palette.accent} 100%)` }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_55%)]" aria-hidden />
                  <div className="absolute bottom-3 left-5 flex items-center gap-2 text-white">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                      <CatalogIcon name={TYPE_ICON[kit.businessTypeSlug]} className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs/none opacity-85">{kit.businessTypeName} · {kit.industryName}</p>
                      <p className="text-lg font-bold leading-tight">{kit.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {tagline ? (
                    <p className="flex items-start gap-1.5 text-sm font-medium">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> “{tagline}”
                    </p>
                  ) : null}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{kit.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {kit.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span>{serviceCount} dịch vụ · 3 gói giá · 30 nội dung</span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      Xem kit <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-dashed bg-muted/30 p-6 text-center">
            <p className="font-medium">Không thấy ngành của bạn?</p>
            <p className="mt-1 text-sm text-muted-foreground">LaunchKit hỗ trợ 8 loại hình và 38 ngành. Nội dung luôn được viết từ mô tả của chính bạn.</p>
            <Button asChild className="mt-4">
              <Link href="/onboarding">
                Tạo kit cho ngành của bạn <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
      <Section className="pt-0">
        <div className="container-x">
          <CtaBanner title="Kit của bạn sẽ trông thế nào?" description="Trả lời 11 câu hỏi và xem ngay bản xem trước miễn phí." secondaryHref="/how-it-works" secondaryLabel="Cách hoạt động" />
        </div>
      </Section>
    </>
  );
}
