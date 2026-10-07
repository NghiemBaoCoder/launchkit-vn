import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Briefcase, CheckCircle2, Plus } from "lucide-react";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import { CheckoutForm, type CheckoutProduct } from "@/components/commerce/checkout-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { checkOwnership, findActiveProduct, isUuid } from "@/lib/payments/orders";
import { formatVND } from "@/lib/utils";
import { effectivePrice } from "@/lib/payments/pricing";
import { getPaymentMethods } from "@/lib/payments/methods";

export const metadata: Metadata = { title: "Thanh toán" };

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: Promise<{ business?: string; coupon?: string }> }) {
  const [{ productId }, sp] = await Promise.all([params, searchParams]);
  const profile = await requireProfile(`/checkout/${productId}${sp.business ? `?business=${sp.business}` : ""}`);
  const product = await findActiveProduct(productId);
  if (!product || product.kind === "free") notFound();

  const supabase = await createClient();
  const { data: businesses } = await supabase.from("businesses").select("id, name, status, location").eq("user_id", profile.id).neq("status", "archived").order("created_at", { ascending: false });
  const list = businesses ?? [];
  const scopeBusiness = product.entitlement_scope === "business";
  const selected = scopeBusiness && isUuid(sp.business) ? (list.find((b) => b.id === sp.business) ?? null) : null;
  const invalidBusiness = scopeBusiness && !!sp.business && !selected;

  const features = (Array.isArray(product.features) ? (product.features as unknown[]) : []).filter((f): f is string => typeof f === "string");
  const checkoutProduct: CheckoutProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    features,
    price: product.price,
    sale_price: product.sale_price,
    kind: product.kind,
    credits: product.credits,
    entitlement_scope: product.entitlement_scope,
    billing_interval: product.billing_interval,
  };

  const tracker = (
    <Suspense fallback={null}>
      <AnalyticsTracker event="checkout_view" properties={{ product: product.slug, business_id: selected?.id ?? null }} />
    </Suspense>
  );

  // Cần chọn business
  if (scopeBusiness && !selected) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {tracker}
        <PageHeader eyebrow="Thanh toán" title={`Mua ${product.name}`} description={`Gói ${product.name} được áp dụng cho một business cụ thể. Hãy chọn business bạn muốn mở khoá.`} />
        {invalidBusiness ? (
          <Alert variant="warning">
            <AlertTitle>Không tìm thấy business</AlertTitle>
            <AlertDescription>Business được chọn không tồn tại hoặc không thuộc tài khoản của bạn. Vui lòng chọn lại bên dưới.</AlertDescription>
          </Alert>
        ) : null}
        {list.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Bạn chưa có business nào"
            description="Tạo Business Kit đầu tiên (miễn phí) rồi quay lại đây để mở khoá bản đầy đủ."
            action={
              <Button asChild variant="premium"><Link href="/onboarding"><Plus /> Tạo business mới</Link></Button>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chọn business</CardTitle>
              <CardDescription>{product.name} — {formatVND(effectivePrice(product))}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {list.map((b) => (
                <Link key={b.id} href={`/checkout/${product.slug}?business=${b.id}${sp.coupon ? `&coupon=${encodeURIComponent(sp.coupon)}` : ""}`} className="group flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-primary hover:bg-primary/5">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="size-4" /></span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{b.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{b.location ?? "—"}</span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
              <Link href="/onboarding" className="flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Plus className="size-4" /> Tạo business mới</Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const ownership = await checkOwnership(profile.id, product, selected?.id ?? null);
  const alreadyOwned = ownership.owned || (product.kind === "subscription" && !!ownership.activeSubscriptionId);
  if (alreadyOwned) {
    const href = selected ? `/business/${selected.id}/overview` : "/dashboard/billing";
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {tracker}
        <PageHeader eyebrow="Thanh toán" title={product.name} />
        <EmptyState
          icon={CheckCircle2}
          title={selected ? "Bạn đã sở hữu gói này cho business này" : "Bạn đã sở hữu gói này"}
          description={selected ? `${product.name} đã được mở khoá cho "${selected.name}". Không cần mua lại.` : `${product.name} đang hoạt động trên tài khoản của bạn.`}
          action={
            <>
              <Button asChild variant="premium"><Link href={href}>{selected ? "Mở workspace" : "Xem gói & thanh toán"} <ArrowRight /></Link></Button>
              <Button asChild variant="outline"><Link href="/pricing">So sánh các gói</Link></Button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {tracker}
      <PageHeader eyebrow="Thanh toán" title={`Mua ${product.name}`} description="Kiểm tra đơn hàng, áp dụng mã giảm giá và chọn phương thức thanh toán." actions={<Button asChild variant="ghost" size="sm"><Link href="/pricing">So sánh các gói</Link></Button>} />
      <CheckoutForm product={checkoutProduct} businessId={selected?.id ?? null} businessName={selected?.name ?? null} initialCoupon={sp.coupon} methods={getPaymentMethods()} />
    </div>
  );
}
