"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createOrderAction, previewCouponAction, type CouponPreview } from "@/lib/actions/checkout";
import { PAYMENT_METHODS } from "@/lib/payments/labels";
import { computeTotal, effectivePrice } from "@/lib/payments/pricing";
import { cn, formatVND } from "@/lib/utils";

export interface CheckoutProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  features: string[];
  price: number;
  sale_price: number | null;
  kind: "free" | "one_time" | "subscription";
  credits: number;
  entitlement_scope: string;
  billing_interval: string | null;
}

interface CheckoutFormProps {
  product: CheckoutProduct;
  businessId: string | null;
  businessName: string | null;
  initialCoupon?: string;
}

export function CheckoutForm({ product, businessId, businessName, initialCoupon }: CheckoutFormProps) {
  const router = useRouter();
  const [code, setCode] = React.useState(initialCoupon ?? "");
  const [applied, setApplied] = React.useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [applying, setApplying] = React.useState(false);
  const [method, setMethod] = React.useState("mock");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<{ message: string; code?: string } | null>(null);

  const subtotal = effectivePrice(product);
  const discount = applied?.discount ?? 0;
  const total = computeTotal(subtotal, discount);
  const hasSale = product.sale_price !== null && product.sale_price < product.price;

  async function applyCoupon() {
    const trimmed = code.trim();
    if (!trimmed) {
      setCouponError("Nhập mã giảm giá trước khi áp dụng.");
      return;
    }
    setApplying(true);
    setCouponError(null);
    try {
      const res = await previewCouponAction({ productSlug: product.slug, code: trimmed, businessId });
      if (!res.ok) {
        setApplied(null);
        setCouponError(res.error);
        return;
      }
      setApplied(res.data);
      setCode(res.data.coupon.code);
      toast.success(`Đã áp dụng mã ${res.data.coupon.code}: giảm ${formatVND(res.data.discount)}`);
    } finally {
      setApplying(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCouponError(null);
    setCode("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!acceptTerms) {
      setFormError({ message: "Bạn cần đồng ý Điều khoản sử dụng và Chính sách hoàn tiền để tiếp tục.", code: "terms" });
      return;
    }
    if (method !== "mock") {
      setFormError({ message: "Phương thức này chưa được tích hợp. Vui lòng chọn Mock Payment (demo)." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrderAction({ productSlug: product.slug, businessId, couponCode: applied?.coupon.code ?? null, acceptTerms });
      if (!res.ok) {
        setFormError({ message: res.error, code: res.code });
        if (res.code === "coupon") {
          setApplied(null);
          setCouponError(res.error);
        }
        toast.error(res.error);
        return;
      }
      if (res.message) toast.success(res.message);
      router.push(res.data.redirectTo);
    } finally {
      setSubmitting(false);
    }
  }

  const workspaceHref = businessId ? `/business/${businessId}/overview` : "/dashboard/billing";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Tóm tắt đơn hàng */}
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              {product.kind === "subscription" ? <Badge variant="premium">Gói tháng</Badge> : <Badge variant="secondary">Thanh toán một lần</Badge>}
            </div>
            {product.description ? <CardDescription>{product.description}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight">{formatVND(subtotal)}</span>
              {hasSale ? <span className="text-base text-muted-foreground line-through">{formatVND(product.price)}</span> : null}
              {product.kind === "subscription" ? <span className="text-sm text-muted-foreground">/ {product.billing_interval === "year" ? "năm" : "tháng"}</span> : null}
              {hasSale ? <Badge variant="success">Tiết kiệm {Math.round(((product.price - subtotal) / product.price) * 100)}%</Badge> : null}
            </div>
            {product.features.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {product.credits > 0 ? (
              <p className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Tặng kèm <strong>{product.credits} credits</strong> để tạo lại nội dung.</span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Áp dụng cho</CardTitle>
          </CardHeader>
          <CardContent>
            {product.entitlement_scope === "business" ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Business</div>
                  <div className="truncate font-medium">{businessName ?? "Chưa chọn"}</div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/checkout/${product.slug}`}>Đổi business</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <div className="font-medium">Toàn bộ tài khoản</div>
                <p className="text-muted-foreground">Quyền được áp dụng cho mọi business hiện có và tạo sau này.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Thanh toán */}
      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mã giảm giá */}
            <div className="space-y-2">
              <Label htmlFor="coupon">Mã giảm giá</Label>
              {applied ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Tag className="size-4 shrink-0 text-success" />
                    <div className="min-w-0">
                      <div className="font-mono font-semibold">{applied.coupon.code}</div>
                      {applied.coupon.description ? <div className="truncate text-xs text-muted-foreground">{applied.coupon.description}</div> : null}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={removeCoupon} aria-label="Bỏ mã giảm giá"><X /></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    name="coupon"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setCouponError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void applyCoupon(); } }}
                    placeholder="VD: DEMO50"
                    autoComplete="off"
                    aria-invalid={!!couponError}
                    className="font-mono uppercase"
                  />
                  <Button type="button" variant="outline" onClick={applyCoupon} loading={applying}>Áp dụng</Button>
                </div>
              )}
              {couponError ? <p className="text-xs text-destructive" role="alert">{couponError}</p> : null}
            </div>

            {/* Phương thức */}
            <fieldset className="min-w-0 space-y-2">
              <legend className="mb-2 text-sm font-medium">Phương thức thanh toán</legend>
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    method === m.id && m.enabled ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                    !m.enabled && "cursor-not-allowed opacity-60",
                  )}
                  title={!m.enabled ? "Cần tích hợp" : undefined}
                >
                  <input type="radio" name="payment_method" value={m.id} checked={method === m.id} disabled={!m.enabled} onChange={() => setMethod(m.id)} className="accent-primary" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{m.label}</span>
                    <span className="truncate text-xs text-muted-foreground">{m.description}</span>
                  </span>
                  {!m.enabled ? <Badge variant="outline">Cần tích hợp</Badge> : <Badge variant="info">Demo</Badge>}
                </label>
              ))}
            </fieldset>

            <Separator />

            {/* Tổng */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatVND(subtotal)}</span></div>
              {discount > 0 ? <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span className="text-success">−{formatVND(discount)}</span></div> : null}
              <div className="flex items-baseline justify-between pt-1"><span className="font-semibold">Tổng cộng</span><span className="text-2xl font-bold tracking-tight">{formatVND(total)}</span></div>
              {total === 0 ? <p className="text-xs text-muted-foreground">Đơn hàng 0đ sẽ được kích hoạt ngay, không qua cổng thanh toán.</p> : null}
            </div>

            {/* Điều khoản */}
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => { setAcceptTerms(v === true); if (v === true && formError?.code === "terms") setFormError(null); }} aria-invalid={formError?.code === "terms"} />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                Tôi đồng ý với <Link href="/terms" target="_blank" className="text-primary hover:underline">Điều khoản sử dụng</Link> và <Link href="/refund-policy" target="_blank" className="text-primary hover:underline">Chính sách hoàn tiền</Link>.
              </Label>
            </div>

            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>{formError.code === "already_owned" || formError.code === "already_subscribed" ? "Bạn đã có gói này" : "Không thể tạo đơn hàng"}</AlertTitle>
                <AlertDescription>
                  <p>{formError.message}</p>
                  {formError.code === "already_owned" || formError.code === "already_subscribed" ? (
                    <Link href={workspaceHref} className="font-medium underline">{businessId ? "Mở workspace" : "Xem gói & thanh toán"}</Link>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" size="lg" variant="premium" className="w-full" loading={submitting} disabled={submitting}>
              <Lock /> {total === 0 ? "Kích hoạt miễn phí" : `Thanh toán ${formatVND(total)}`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Giao dịch demo — không trừ tiền thật.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
