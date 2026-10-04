import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ENTITLEMENT_KEYS, ENTITLEMENT_LABELS, type EntitlementKey } from "@/lib/access/policy";
import { cn, formatVND } from "@/lib/utils";
import type { Product } from "@/types";

export function featuresOf(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

export function productCta(p: Product): { href: string; label: string; variant: "default" | "outline" | "premium" } {
  if (p.kind === "free") return { href: "/onboarding", label: "Bắt đầu miễn phí", variant: "outline" };
  if (p.slug === "business-kit-pro") return { href: `/checkout/${p.slug}`, label: `Mua ${p.name}`, variant: "premium" };
  if (p.kind === "subscription") return { href: `/checkout/${p.slug}`, label: `Đăng ký ${p.name}`, variant: "outline" };
  return { href: `/checkout/${p.slug}`, label: `Mua ${p.name}`, variant: "default" };
}

function discountPct(p: Product): number | null {
  if (!p.sale_price || p.sale_price >= p.price || p.price <= 0) return null;
  return Math.round((1 - p.sale_price / p.price) * 100);
}

function PriceBlock({ product }: { product: Product }) {
  if (product.kind === "free") {
    return (
      <div>
        <p className="text-4xl font-bold tracking-tight">0đ</p>
        <p className="mt-1 text-xs text-muted-foreground">Miễn phí mãi mãi · 1 business</p>
      </div>
    );
  }
  const current = product.sale_price ?? product.price;
  const pct = discountPct(product);
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-4xl font-bold tracking-tight">{formatVND(current)}</p>
        {product.billing_interval === "month" ? <span className="text-sm text-muted-foreground">/ tháng</span> : null}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {product.sale_price ? <s>{formatVND(product.price)}</s> : null}
        {pct ? <Badge variant="success">Tiết kiệm {pct}%</Badge> : null}
        <span>{product.kind === "subscription" ? "Gia hạn hàng tháng, huỷ bất cứ lúc nào" : "Thanh toán một lần · 1 business"}</span>
      </div>
    </div>
  );
}

export function PlanCard({ product, className }: { product: Product; className?: string }) {
  const cta = productCta(product);
  const feats = featuresOf(product.features);
  return (
    <div className={cn("relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-xs", product.recommended && "border-primary shadow-lg ring-2 ring-primary/20", className)}>
      {product.recommended ? <Badge className="absolute -top-3 left-6 shadow">Khuyến nghị</Badge> : null}
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="mt-1 min-h-10 text-sm text-muted-foreground">{product.description}</p>
      <div className="mt-5">
        <PriceBlock product={product} />
      </div>
      <Button asChild variant={cta.variant} size="lg" className="mt-6 w-full">
        <Link href={cta.href}>
          {cta.label} <ArrowRight />
        </Link>
      </Button>
      <ul className="mt-6 space-y-2.5 border-t pt-5 text-sm">
        {feats.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> <span>{f}</span>
          </li>
        ))}
      </ul>
      {product.credits > 0 ? <p className="mt-4 text-xs text-muted-foreground">Tặng {product.credits} credits{product.kind === "subscription" ? " mỗi tháng" : ""}.</p> : null}
    </div>
  );
}

export function PricingPlans({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {products.map((p) => (
        <PlanCard key={p.id} product={p} />
      ))}
    </div>
  );
}

const ENTITLEMENT_GROUPS: { title: string; keys: EntitlementKey[] }[] = [
  { title: "Nội dung Business Kit", keys: ["brand_full", "services_full", "pricing_full", "sales_full", "marketing_full", "content_30", "operations_full", "documents_full"] },
  { title: "Website & xuất bản", keys: ["website_kit", "exports_basic", "premium_exports"] },
  { title: "Tạo lại & mở rộng", keys: ["regeneration", "multiple_businesses", "premium_templates", "advanced_generators"] },
];

function hasEnt(p: Product, key: EntitlementKey) {
  return p.entitlements.includes(key);
}

function CellMark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-success/12 text-success">
      <Check className="size-3.5" aria-hidden />
      <span className="sr-only">Có</span>
    </span>
  ) : (
    <span className="inline-flex size-6 items-center justify-center text-muted-foreground/50">
      <Minus className="size-3.5" aria-hidden />
      <span className="sr-only">Không</span>
    </span>
  );
}

export function PlanComparison({ products }: { products: Product[] }) {
  const allKeys = new Set<string>(ENTITLEMENT_GROUPS.flatMap((g) => g.keys));
  const leftover = ENTITLEMENT_KEYS.filter((k) => !allKeys.has(k));
  const groups = leftover.length ? [...ENTITLEMENT_GROUPS, { title: "Khác", keys: leftover }] : ENTITLEMENT_GROUPS;
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-[260px] bg-card">Tính năng</TableHead>
            {products.map((p) => (
              <TableHead key={p.id} className={cn("text-center", p.recommended && "text-primary")}>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs font-normal text-muted-foreground">{p.kind === "free" ? "0đ" : `${formatVND(p.sale_price ?? p.price)}${p.billing_interval === "month" ? "/tháng" : ""}`}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell className="sticky left-0 z-10 bg-card font-medium">Số business</TableCell>
            {products.map((p) => (
              <TableCell key={p.id} className="text-center text-sm">
                {p.kind === "subscription" ? "Không giới hạn" : "1 business"}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell className="sticky left-0 z-10 bg-card font-medium">Credits tạo nội dung</TableCell>
            {products.map((p) => (
              <TableCell key={p.id} className="text-center text-sm">
                {p.kind === "free" ? "3 khi đăng ký" : p.kind === "subscription" ? `${p.credits} / tháng` : `+${p.credits}`}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell className="sticky left-0 z-10 bg-card font-medium">Phạm vi áp dụng</TableCell>
            {products.map((p) => (
              <TableCell key={p.id} className="text-center text-sm">
                {p.entitlement_scope === "account" ? "Toàn tài khoản" : "Từng business"}
              </TableCell>
            ))}
          </TableRow>
          {groups.map((g) => (
            <GroupRows key={g.title} title={g.title} keys={g.keys} products={products} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GroupRows({ title, keys, products }: { title: string; keys: EntitlementKey[]; products: Product[] }) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell colSpan={products.length + 1} className="sticky left-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </TableCell>
      </TableRow>
      {keys.map((k) => (
        <TableRow key={k} className="hover:bg-transparent">
          <TableCell className="sticky left-0 z-10 bg-card text-sm">{ENTITLEMENT_LABELS[k]}</TableCell>
          {products.map((p) => (
            <TableCell key={p.id} className="text-center">
              <CellMark ok={hasEnt(p, k)} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
