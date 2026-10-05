import type { Metadata } from "next";
import { AlertTriangle, BadgePercent, Gift, Link2, MousePointerClick, ShoppingBag, UserPlus, Wallet } from "lucide-react";
import { OrderStatusBadge } from "@/components/commerce/status-badges";
import { AFFILIATE_STATUS_LABELS, AFFILIATE_STATUS_VARIANTS, COMMISSION_PAYOUT_MIN, COMMISSION_STATUS_LABELS, COMMISSION_STATUS_VARIANTS } from "@/components/settings/referral-labels";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireProfile } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatNumber, formatVND } from "@/lib/utils";
import type { Affiliate, Commission, OrderStatus, Profile } from "@/types";

export const metadata: Metadata = { title: "Giới thiệu bạn bè" };

type OrderSummary = { id: string; order_number: string; total: number; created_at: string; status: OrderStatus };
type CommissionRow = Commission & { order: OrderSummary | null };

/** Lấy affiliate của người dùng; tạo mới nếu chưa có (mã = referral_code, trạng thái theo cài đặt site). */
async function getOrCreateAffiliate(profile: Profile): Promise<Affiliate | null> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("affiliates").select("*").eq("user_id", profile.id).maybeSingle();
  if (existing) return existing;

  const settings = await getSiteSettings();
  const admin = createAdminClient();
  const { data: created, error } = await admin
    .from("affiliates")
    .insert({ user_id: profile.id, code: profile.referral_code, status: settings.affiliate_auto_approve ? "approved" : "pending", commission_rate: settings.referral_percentage })
    .select("*")
    .single();
  if (!error && created) return created;

  // Có thể vừa được tạo bởi request song song → đọc lại.
  const { data: again } = await supabase.from("affiliates").select("*").eq("user_id", profile.id).maybeSingle();
  return again ?? null;
}

export default async function ReferralSettingsPage() {
  const [profile, settings] = await Promise.all([requireProfile("/settings/referrals"), getSiteSettings()]);
  const affiliate = await getOrCreateAffiliate(profile);
  if (!affiliate) {
    return <EmptyState icon={Gift} title="Chưa thể khởi tạo chương trình giới thiệu" description={`Vui lòng tải lại trang. Nếu vẫn lỗi, liên hệ ${settings.support_email}.`} />;
  }

  const supabase = await createClient();
  const [{ count: signupCount }, { data: allCommissions }, { data: recentCommissions }] = await Promise.all([
    supabase.from("referral_signups").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
    supabase.from("commissions").select("amount, status").eq("affiliate_id", affiliate.id),
    supabase.from("commissions").select("*").eq("affiliate_id", affiliate.id).order("created_at", { ascending: false }).limit(20),
  ]);

  // Đơn hàng của người được giới thiệu không nằm trong RLS của affiliate → chỉ đọc các cột tối thiểu
  // bằng admin client, sau khi commissions (đã qua RLS) xác nhận chúng thuộc affiliate này.
  const recent = (recentCommissions ?? []) as Commission[];
  const orderIds = recent.map((c) => c.order_id);
  const orderById = new Map<string, OrderSummary>();
  if (orderIds.length > 0) {
    const { data: orders } = await createAdminClient().from("orders").select("id, order_number, total, created_at, status").in("id", orderIds);
    for (const o of orders ?? []) orderById.set(o.id, o);
  }
  const rows: CommissionRow[] = recent.map((c) => ({ ...c, order: orderById.get(c.order_id) ?? null }));

  const all = allCommissions ?? [];
  const sumWhere = (pred: (c: { amount: number; status: Commission["status"] }) => boolean) => all.filter(pred).reduce((s, c) => s + Number(c.amount), 0);
  const totalCommission = sumWhere((c) => c.status !== "rejected");
  const paidCommission = sumWhere((c) => c.status === "paid");
  const pendingCommission = sumWhere((c) => c.status === "pending" || c.status === "approved");
  const purchases = all.filter((c) => c.status !== "rejected").length;
  const signups = signupCount ?? 0;
  const rate = Number(affiliate.commission_rate);
  const link = `${env.appUrl}/?ref=${affiliate.code}`;
  const hasActivity = affiliate.clicks > 0 || signups > 0 || all.length > 0;

  const steps = [
    { icon: Link2, title: "Chia sẻ link giới thiệu", body: "Gửi link cho bạn bè, đăng lên mạng xã hội hoặc cộng đồng khởi nghiệp của bạn." },
    { icon: UserPlus, title: "Bạn bè đăng ký qua link", body: "Mỗi tài khoản mới tạo từ link của bạn được ghi nhận là lượt giới thiệu." },
    { icon: ShoppingBag, title: "Họ mua gói LaunchKit", body: `Bạn nhận ${formatNumber(rate)}% giá trị mỗi đơn hàng thanh toán thành công.` },
    { icon: Wallet, title: "Nhận hoa hồng", body: `Thanh toán hoa hồng thủ công hàng tháng, tối thiểu ${formatVND(COMMISSION_PAYOUT_MIN)}.` },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-4 text-muted-foreground" /> Link giới thiệu của bạn
          </CardTitle>
          <CardDescription>
            Hoa hồng {formatNumber(rate)}% cho mỗi đơn hàng thành công từ người bạn giới thiệu.
          </CardDescription>
          <CardAction>
            <Badge variant={AFFILIATE_STATUS_VARIANTS[affiliate.status]}>{AFFILIATE_STATUS_LABELS[affiliate.status]}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={link} readOnly className="font-mono text-xs sm:text-sm" aria-label="Link giới thiệu" />
            <CopyButton value={link} label="Sao chép link" successMessage="Đã sao chép link giới thiệu" variant="default" size="default" className="shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Mã giới thiệu:</span>
            <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-sm font-semibold text-foreground">{affiliate.code}</code>
            <CopyButton value={affiliate.code} label="Sao chép mã" successMessage="Đã sao chép mã giới thiệu" size="icon-sm" variant="ghost" />
          </div>
          {affiliate.status === "pending" ? (
            <Alert variant="info">
              <AlertTriangle />
              <AlertTitle>Mã đang chờ duyệt</AlertTitle>
              <AlertDescription>Bạn vẫn có thể chia sẻ link; hoa hồng chỉ được tính cho các đơn phát sinh sau khi mã được duyệt.</AlertDescription>
            </Alert>
          ) : null}
          {affiliate.status === "rejected" ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Yêu cầu tham gia chưa được chấp thuận</AlertTitle>
              <AlertDescription>Liên hệ {settings.support_email} để được hỗ trợ xét duyệt lại.</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lượt nhấp" value={formatNumber(affiliate.clicks)} icon={MousePointerClick} hint="Số lần link được mở" />
        <StatCard label="Đăng ký" value={formatNumber(signups)} icon={UserPlus} hint="Tài khoản tạo từ link" />
        <StatCard label="Đơn hàng" value={formatNumber(purchases)} icon={ShoppingBag} hint="Đơn phát sinh hoa hồng" />
        <StatCard label="Tổng hoa hồng" value={formatVND(totalCommission)} icon={BadgePercent} hint={`Chờ ${formatVND(pendingCommission)} · Đã trả ${formatVND(paidCommission)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="py-0 lg:col-span-2">
          <CardHeader className="pt-5">
            <CardTitle>Hoa hồng gần đây</CardTitle>
            <CardDescription>20 khoản hoa hồng mới nhất, kèm đơn hàng tương ứng.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-5">
            {rows.length === 0 ? (
              <div className="px-5">
                <EmptyState
                  compact
                  icon={hasActivity ? ShoppingBag : Gift}
                  title={hasActivity ? "Chưa có đơn hàng phát sinh hoa hồng" : "Chưa có hoạt động giới thiệu"}
                  description={hasActivity ? "Hoa hồng xuất hiện khi người bạn giới thiệu thanh toán gói thành công." : "Bắt đầu bằng cách chia sẻ link giới thiệu của bạn cho bạn bè hoặc cộng đồng."}
                  action={<CopyButton value={link} label="Sao chép link giới thiệu" successMessage="Đã sao chép link giới thiệu" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Thời gian</TableHead>
                      <TableHead>Đơn hàng</TableHead>
                      <TableHead className="hidden text-right md:table-cell">Giá trị đơn</TableHead>
                      <TableHead className="text-right">Hoa hồng</TableHead>
                      <TableHead className="pr-5">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="pl-5 text-muted-foreground">{formatDateTime(c.created_at)}</TableCell>
                        <TableCell>
                          <div className="font-mono text-xs font-medium">{c.order?.order_number ?? "—"}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {c.order ? <OrderStatusBadge status={c.order.status} /> : null}
                            <span className="md:hidden">{c.order ? formatVND(c.order.total) : ""}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">{c.order ? formatVND(c.order.total) : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold tabular-nums">{formatVND(c.amount)}</div>
                          <div className="text-xs text-muted-foreground">{formatNumber(Number(c.rate))}%</div>
                        </TableCell>
                        <TableCell className="pr-5">
                          <Badge variant={COMMISSION_STATUS_VARIANTS[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                          {c.paid_at ? <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(c.paid_at)}</div> : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cách hoạt động</CardTitle>
            <CardDescription>4 bước để nhận hoa hồng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <div className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="size-4" />
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{step.title}</div>
                    <p className="text-xs text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Alert>
              <Wallet />
              <AlertTitle>Thanh toán hoa hồng</AlertTitle>
              <AlertDescription>
                <p>
                  Thanh toán hoa hồng thủ công hàng tháng, tối thiểu {formatVND(COMMISSION_PAYOUT_MIN)}. Tỷ lệ hiện tại của bạn: <strong className="text-foreground">{formatNumber(rate)}%</strong>.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
