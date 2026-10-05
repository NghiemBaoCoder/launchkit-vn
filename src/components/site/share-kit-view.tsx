import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MapPin, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORKSPACE_SECTIONS } from "@/lib/constants";
import { cn, formatVND, initials } from "@/lib/utils";
import { AssetContentView } from "./asset-content-view";
import { KIT_MODULES } from "./kit-modules";

export interface SharedKit {
  business: {
    id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
    location: string | null;
    business_type: string | null;
    industry: string | null;
  };
  sections: string[];
  assets: { category: string; key: string; title: string; content: unknown }[];
  services: { name: string; description: string | null; price: number; sale_price: number | null; unit: string | null; features: unknown }[];
  packages: { name: string; tier: string; price: number; billing_unit: string | null; features: unknown; recommended: boolean; description: string | null }[];
}

const TIER_LABEL: Record<string, string> = { basic: "Cơ bản", standard: "Tiêu chuẩn", premium: "Cao cấp", custom: "Tuỳ chỉnh" };

function stringList(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

function sectionLabel(key: string): string {
  return WORKSPACE_SECTIONS.find((s) => s.key === key)?.label ?? key;
}

export function ShareKitView({ kit }: { kit: SharedKit }) {
  const { business } = kit;
  const grouped = new Map<string, SharedKit["assets"]>();
  for (const a of kit.assets) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }
  const order = WORKSPACE_SECTIONS.map((s) => s.key as string);
  const categories = [...grouped.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const hasServices = kit.services.length > 0;
  const hasPackages = kit.packages.length > 0;
  const nav: { id: string; label: string }[] = [
    ...categories.map((c) => ({ id: `cat-${c}`, label: sectionLabel(c) })),
    ...(hasServices && !categories.includes("services") ? [{ id: "shared-services", label: "Dịch vụ" }] : []),
    ...(hasPackages && !categories.includes("pricing") ? [{ id: "shared-packages", label: "Bảng giá" }] : []),
  ];
  const isEmpty = categories.length === 0 && !hasServices && !hasPackages;

  return (
    <div>
      <div className="surface-glow border-b">
        <div className="container-x py-12 sm:py-16">
          <Badge variant="secondary" className="gap-1.5">
            <Rocket className="size-3 text-primary" /> Business Kit được chia sẻ từ LaunchKit VN
          </Badge>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {business.logo_url ? (
              <Image src={business.logo_url} alt={`Logo ${business.name}`} width={80} height={80} unoptimized className="size-20 rounded-2xl border bg-card object-cover shadow-xs" />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-2xl font-bold text-white shadow-md">{initials(business.name)}</span>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{business.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {business.business_type ? <span>{business.business_type}</span> : null}
                {business.industry ? <span>· {business.industry}</span> : null}
                {business.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {business.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {nav.length ? (
            <nav aria-label="Các phần được chia sẻ" className="mt-6 flex flex-wrap gap-1.5">
              {nav.map((n) => (
                <a key={n.id} href={`#${n.id}`} className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                  {n.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <div className="container-x space-y-14 py-12 lg:py-16">
        {isEmpty ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">Chủ kit chưa chọn phần nào để chia sẻ.</div>
        ) : null}

        {categories.map((cat) => {
          const mod = KIT_MODULES.find((m) => m.key === cat);
          const Icon = mod?.icon ?? Rocket;
          const assets = grouped.get(cat) ?? [];
          return (
            <section key={cat} id={`cat-${cat}`} className="scroll-mt-24">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{sectionLabel(cat)}</h2>
                  <p className="text-sm text-muted-foreground">{assets.length} mục</p>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {assets.map((a) => (
                  <article key={`${a.category}-${a.key}`} className={cn("rounded-2xl border bg-card p-6 shadow-xs", ["persona", "consultation_script", "launch_strategy", "follow_up", "channels", "long_message"].includes(a.key) && "lg:col-span-2")}>
                    <h3 className="text-base font-semibold">{a.title}</h3>
                    <div className="mt-4">
                      <AssetContentView content={a.content} />
                    </div>
                  </article>
                ))}
              </div>
              {cat === "services" && hasServices ? <ServicesGrid services={kit.services} className="mt-5" /> : null}
              {cat === "pricing" && hasPackages ? <PackagesGrid packages={kit.packages} className="mt-5" /> : null}
            </section>
          );
        })}

        {hasServices && !categories.includes("services") ? (
          <section id="shared-services" className="scroll-mt-24">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Dịch vụ</h2>
            <ServicesGrid services={kit.services} />
          </section>
        ) : null}
        {hasPackages && !categories.includes("pricing") ? (
          <section id="shared-packages" className="scroll-mt-24">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Bảng giá</h2>
            <PackagesGrid packages={kit.packages} />
          </section>
        ) : null}

        <div className="rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 px-6 py-12 text-center text-white shadow-xl sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Được tạo bằng LaunchKit VN</p>
          <h2 className="mt-2 text-balance text-2xl font-bold sm:text-3xl">Tạo kit của bạn trong 10 phút</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">Thương hiệu, bảng giá, kịch bản bán hàng, marketing 30 ngày, 30 nội dung và website — viết riêng cho business của bạn.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/onboarding">
                Tạo kit của bạn <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/examples">Xem ví dụ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesGrid({ services, className }: { services: SharedKit["services"]; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {services.map((s) => (
        <div key={s.name} className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{s.name}</h3>
            <div className="text-right">
              <p className="font-bold">{formatVND(s.sale_price ?? s.price)}</p>
              {s.sale_price ? <s className="text-xs text-muted-foreground">{formatVND(s.price)}</s> : null}
              {s.unit ? <p className="text-[11px] text-muted-foreground">/ {s.unit}</p> : null}
            </div>
          </div>
          {s.description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p> : null}
          {stringList(s.features).length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {stringList(s.features).map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PackagesGrid({ packages, className }: { packages: SharedKit["packages"]; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {packages.map((p) => (
        <div key={`${p.tier}-${p.name}`} className={cn("relative flex flex-col rounded-2xl border bg-card p-5 shadow-xs", p.recommended && "border-primary ring-2 ring-primary/20")}>
          {p.recommended ? <Badge className="absolute -top-3 left-5">Khuyến nghị</Badge> : null}
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{TIER_LABEL[p.tier] ?? p.tier}</p>
          <h3 className="mt-1 font-semibold">{p.name}</h3>
          {p.description ? <p className="mt-1 text-xs text-muted-foreground">{p.description}</p> : null}
          <p className="mt-3 text-2xl font-bold tracking-tight">{formatVND(p.price)}</p>
          {p.billing_unit ? <p className="text-xs text-muted-foreground">/ {p.billing_unit}</p> : null}
          {stringList(p.features).length ? (
            <ul className="mt-4 space-y-1.5 text-sm">
              {stringList(p.features).map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
