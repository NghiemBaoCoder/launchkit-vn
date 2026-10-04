import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { effectivePrice } from "@/lib/payments/pricing";
import { formatVND } from "@/lib/utils";
import type { Product } from "@/types";

/** Thẻ gợi ý nâng cấp (dùng ở trang Gói & thanh toán). */
export function UpgradeCards({ products, businessId }: { products: Product[]; businessId?: string | null }) {
  const paid = products.filter((p) => p.kind !== "free" && p.active);
  if (paid.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {paid.map((p) => {
        const price = effectivePrice(p);
        const features = (Array.isArray(p.features) ? (p.features as unknown[]) : []).filter((f): f is string => typeof f === "string").slice(0, 4);
        const href = p.entitlement_scope === "business" && businessId ? `/checkout/${p.slug}?business=${businessId}` : `/checkout/${p.slug}`;
        return (
          <Card key={p.id} className={p.recommended ? "border-primary/50 shadow-md" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                {p.recommended ? <Badge variant="premium">Phổ biến</Badge> : null}
              </div>
              {p.description ? <CardDescription className="line-clamp-2">{p.description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{formatVND(price)}</span>
                {p.sale_price !== null && p.sale_price < p.price ? <span className="text-sm text-muted-foreground line-through">{formatVND(p.price)}</span> : null}
                {p.kind === "subscription" ? <span className="text-xs text-muted-foreground">/ tháng</span> : null}
              </div>
              <ul className="space-y-1.5 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>
                ))}
              </ul>
              <Button asChild variant={p.recommended ? "premium" : "outline"} className="mt-auto w-full">
                <Link href={href}><Sparkles /> Mua {p.name}</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
