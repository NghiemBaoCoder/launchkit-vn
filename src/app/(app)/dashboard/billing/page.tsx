import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, Coins, CreditCard, History, KeyRound, Receipt, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { PaymentStatusBadge, SubscriptionStatusBadge } from "@/components/commerce/status-badges";
import { SubscriptionActions } from "@/components/commerce/subscription-actions";
import { UpgradeCards } from "@/components/commerce/upgrade-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { derivePlan, ENTITLEMENT_LABELS, PLAN_LABELS, type EntitlementKey } from "@/lib/access/policy";
import { getProducts } from "@/lib/data/catalog";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_PROVIDER_LABELS } from "@/lib/payments/labels";
import { isFuture } from "@/lib/payments/time";
import { formatDate, formatDateTime, formatNumber, formatVND } from "@/lib/utils";
import type { CreditTransaction, Entitlement, Payment, Subscription } from "@/types";

export const metadata: Metadata = { title: "Gói & thanh toán" };

type PaymentRow = Payment & { orders: { order_number: string; products: { name: string } | null } | null };
type SubscriptionRow = Subscription & { products: { name: string; slug: string } | null };

function labelOf(key: string) {
  return ENTITLEMENT_LABELS[key as EntitlementKey] ?? key;
}

export default async function BillingPage() {
  const profile = await requireProfile("/dashboard/billing");
  const supabase = await createClient();
  const [ctx, products, { data: entitlements }, { data: businesses }, { data: credits }, { data: payments }, { data: subscriptions }] = await Promise.all([
    getAccessContext(),
    getProducts(),
    supabase.from("entitlements").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("businesses").select("id, name, status").eq("user_id", profile.id).neq("status", "archived").order("created_at", { ascending: false }),
    supabase.from("credit_transactions").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("payments").select("*, orders(order_number, products(name))").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("subscriptions").select("*, products(name, slug)").eq("user_id", profile.id).order("created_at", { ascending: false }),
  ]);

  const isActive = (e: Entitlement) => !e.expires_at || isFuture(e.expires_at);
  const allEnt = (entitlements ?? []) as Entitlement[];
  const accountEnt = allEnt.filter((e) => e.business_id === null);
  const accountKeys = accountEnt.filter(isActive).map((e) => e.key as EntitlementKey);
  const bizList = businesses ?? [];
  const byBusiness = bizList.map((b) => {
    const rows = allEnt.filter((e) => e.business_id === b.id);
    const keys = rows.filter(isActive).map((e) => e.key as EntitlementKey);
    return { business: b, rows, plan: derivePlan(accountKeys, keys, ctx.isAdmin) };
  });
  const orphanBusinessEnt = allEnt.filter((e) => e.business_id !== null && !bizList.some((b) => b.id === e.business_id));

  const subRows = (subscriptions ?? []) as SubscriptionRow[];
  const latestSubByProduct = new Map<string, string>();
  for (const s of subRows) if (!latestSubByProduct.has(s.product_id)) latestSubByProduct.set(s.product_id, s.id);
  const activeSub = subRows.find((s) => s.status === "active" && isFuture(s.current_period_end)) ?? null;
  const payRows = (payments ?? []) as PaymentRow[];
  const creditRows = (credits ?? []) as CreditTransaction[];
  const totalSpent = payRows.filter((p) => p.status === "succeeded").reduce((s, p) => s + Number(p.amount), 0);
  const isFree = ctx.plan === "free" && byBusiness.every((b) => b.plan === "free");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Gói & thanh toán"
        description="Gói hiện tại, quyền đã mở khoá, credits và lịch sử thanh toán."
        actions={
          <>
            <Button asChild variant="outline"><Link href="/dashboard/purchases"><Receipt /> Đơn hàng</Link></Button>
            <Button asChild variant="premium"><Link href="/pricing"><Sparkles /> Nâng cấp</Link></Button>
          </>
        }
      />

      {/* Tổng quan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gói tài khoản" value={PLAN_LABELS[ctx.plan]} icon={ShieldCheck} hint={activeSub ? `Gia hạn ${activeSub.cancel_at_period_end ? "kết thúc" : "tiếp theo"}: ${formatDate(activeSub.current_period_end)}` : ctx.plan === "free" ? "Mở khoá theo từng business hoặc nâng cấp Pro" : undefined} />
        <StatCard label="Credits" value={formatNumber(profile.credits)} icon={Coins} hint="Dùng để tạo lại nội dung" />
        <StatCard label="Business đã mở khoá" value={`${byBusiness.filter((b) => b.plan !== "free").length}/${bizList.length}`} icon={Briefcase} />
        <StatCard label="Tổng đã thanh toán" value={formatVND(totalSpent)} icon={CreditCard} />
      </div>

      {isFree ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Nâng cấp để mở khoá toàn bộ</h2>
            <p className="text-sm text-muted-foreground">Bạn đang dùng gói miễn phí. Chọn gói phù hợp để nhận đầy đủ nội dung, tài liệu và xuất file.</p>
          </div>
          <UpgradeCards products={products} businessId={bizList[0]?.id ?? null} />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entitlements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4 text-muted-foreground" /> Quyền đã mở khoá</CardTitle>
            <CardDescription>Entitlement theo tài khoản và theo từng business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Toàn tài khoản</h3>
                <Badge variant={ctx.plan === "free" ? "secondary" : "premium"}>{PLAN_LABELS[ctx.plan]}</Badge>
              </div>
              {accountEnt.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có quyền cấp tài khoản. Pro Membership mở khoá mọi business cùng lúc.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {accountEnt.map((e) => (
                    <li key={e.id}>
                      <Badge variant={isActive(e) ? "info" : "outline"} title={e.expires_at ? `Hết hạn ${formatDate(e.expires_at)}` : "Vĩnh viễn"}>
                        {labelOf(e.key)}{e.expires_at ? ` · ${isActive(e) ? "đến" : "hết hạn"} ${formatDate(e.expires_at)}` : ""}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {byBusiness.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa có business. <Link href="/onboarding" className="text-primary hover:underline">Tạo business đầu tiên</Link>.</p>
            ) : (
              byBusiness.map(({ business, rows, plan }) => (
                <div key={business.id}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Briefcase className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{business.name}</span></h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={plan === "free" ? "secondary" : "success"}>{PLAN_LABELS[plan]}</Badge>
                      {plan === "free" || plan === "business_kit" ? (
                        <Button asChild size="sm" variant="outline"><Link href={`/checkout/${plan === "free" ? "business-kit" : "business-kit-pro"}?business=${business.id}`}>Mở khoá</Link></Button>
                      ) : (
                        <Button asChild size="sm" variant="ghost"><Link href={`/business/${business.id}/overview`}>Mở</Link></Button>
                      )}
                    </div>
                  </div>
                  {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa mở khoá gói nào cho business này{accountKeys.length ? " (đang dùng quyền tài khoản)" : ""}.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-1.5">
                      {rows.map((e) => (
                        <li key={e.id}><Badge variant={isActive(e) ? "info" : "outline"}>{labelOf(e.key)}</Badge></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
            {orphanBusinessEnt.length > 0 ? <p className="text-xs text-muted-foreground">{orphanBusinessEnt.length} quyền thuộc business đã lưu trữ.</p> : null}
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Coins className="size-4 text-muted-foreground" /> Credits</CardTitle>
            <CardDescription>Số dư hiện tại: <strong className="text-foreground">{formatNumber(profile.credits)}</strong> · 10 giao dịch gần nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            {creditRows.length === 0 ? (
              <EmptyState compact icon={Coins} title="Chưa có giao dịch credits" description="Credits được cộng khi mua gói và trừ khi tạo lại nội dung." />
            ) : (
              <ul className="divide-y">
                {creditRows.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.reason}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(t.created_at)} · Số dư sau: {formatNumber(t.balance_after)}</div>
                    </div>
                    <span className={`shrink-0 font-semibold tabular-nums ${t.amount >= 0 ? "text-success" : "text-destructive"}`}>{t.amount >= 0 ? "+" : ""}{formatNumber(t.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions */}
      <Card className="py-0">
        <CardHeader className="pt-5">
          <CardTitle className="flex items-center gap-2 text-base"><RefreshCw className="size-4 text-muted-foreground" /> Gói đăng ký</CardTitle>
          <CardDescription>Pro Membership gia hạn theo chu kỳ 30 ngày. Huỷ gia hạn bất cứ lúc nào — gói vẫn dùng đến hết chu kỳ.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-5">
          {subRows.length === 0 ? (
            <div className="px-5">
              <EmptyState compact icon={RefreshCw} title="Chưa có gói đăng ký" description="Pro Membership mở khoá mọi business, 50 credits mỗi tháng và template cao cấp." action={<Button asChild variant="premium" size="sm"><Link href="/checkout/pro-membership"><Sparkles /> Đăng ký Pro Membership</Link></Button>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Gói</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden md:table-cell">Chu kỳ hiện tại</TableHead>
                    <TableHead className="hidden lg:table-cell">Cổng</TableHead>
                    <TableHead className="pr-5 text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subRows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-5">
                        <div className="font-medium">{s.products?.name ?? "Pro Membership"}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{formatDate(s.current_period_start)} → {formatDate(s.current_period_end)}</div>
                      </TableCell>
                      <TableCell><SubscriptionStatusBadge status={s.status} cancelAtPeriodEnd={s.cancel_at_period_end} /></TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{formatDate(s.current_period_start)} → {formatDate(s.current_period_end)}</div>
                        {s.canceled_at ? <div className="text-xs text-muted-foreground">Huỷ gia hạn lúc {formatDateTime(s.canceled_at)}</div> : null}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">{PAYMENT_PROVIDER_LABELS[s.provider] ?? s.provider}</TableCell>
                      <TableCell className="pr-5">
                        <SubscriptionActions subscription={{ id: s.id, status: s.status, cancel_at_period_end: s.cancel_at_period_end, current_period_end: s.current_period_end }} latest={latestSubByProduct.get(s.product_id) === s.id} active={s.status === "active" && isFuture(s.current_period_end)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card className="py-0">
        <CardHeader className="pt-5">
          <CardTitle className="flex items-center gap-2 text-base"><History className="size-4 text-muted-foreground" /> Lịch sử thanh toán</CardTitle>
          <CardDescription>20 giao dịch gần nhất.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-5">
          {payRows.length === 0 ? (
            <div className="px-5">
              <EmptyState compact icon={History} title="Chưa có giao dịch" description="Giao dịch sẽ xuất hiện ở đây sau khi bạn thanh toán." action={<Button asChild variant="outline" size="sm"><Link href="/pricing">Xem bảng giá</Link></Button>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Thời gian</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead className="hidden md:table-cell">Cổng</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="pr-5">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payRows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5 text-muted-foreground">{formatDateTime(p.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{p.orders?.products?.name ?? "—"}</div>
                        <div className="font-mono text-xs text-muted-foreground">{p.orders?.order_number ?? p.order_id}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{PAYMENT_PROVIDER_LABELS[p.provider] ?? p.provider}</div>
                        {p.provider_ref ? <div className="font-mono text-xs text-muted-foreground">{p.provider_ref}</div> : null}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatVND(p.amount)}</TableCell>
                      <TableCell className="pr-5"><PaymentStatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
