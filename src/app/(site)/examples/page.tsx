import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXAMPLE_KITS, getExampleKit, findAsset } from "@/lib/examples";
import { paletteByKey } from "@/lib/onboarding/schema";
import { getBusinessTypes, getIndustries } from "@/lib/data/catalog";
import { CatalogIcon } from "@/components/site/catalog-icon";
import { KitCover } from "@/components/site/kit-cover";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { PageIntro, Section, CtaBanner } from "@/components/site/section";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

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

export default async function ExamplesPage() {
  const [types, industries] = await Promise.all([getBusinessTypes(), getIndustries()]);
  const typeCount = types.length || 8;
  const industryCount = industries.length || 38;
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
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
            {kits.map(({ kit, tagline, palette, serviceCount }) => (
              <StaggerItem key={kit.slug} className="flex">
              <Link href={`/examples/${kit.slug}`} className="group flex w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <KitCover name={kit.name} palette={palette} icon={TYPE_ICON[kit.businessTypeSlug]} seed={kit.slug} hideMark className="h-32 transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute bottom-3 left-5 right-5 flex items-center gap-2 text-white">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                      <CatalogIcon name={TYPE_ICON[kit.businessTypeSlug]} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs/none opacity-85">{kit.businessTypeName} · {kit.industryName}</p>
                      <p className="truncate text-lg font-bold leading-tight">{kit.name}</p>
                    </div>
                  </div>
                </KitCover>
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
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 rounded-2xl border border-dashed bg-muted/30 p-6 text-center">
            <p className="font-medium">Không thấy ngành của bạn?</p>
            <p className="mt-1 text-sm text-muted-foreground">LaunchKit hỗ trợ {typeCount} loại hình và {industryCount} ngành. Nội dung luôn được viết từ mô tả của chính bạn.</p>
            <Button asChild className="mt-4">
              <Link href="/onboarding">
                Tạo kit cho ngành của bạn <ArrowRight />
              </Link>
            </Button>
          </Reveal>
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
