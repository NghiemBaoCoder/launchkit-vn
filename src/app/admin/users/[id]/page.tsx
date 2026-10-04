import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, Briefcase, Coins, KeyRound, Receipt, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DetailList } from "@/components/admin/detail-list";
import { UserActions } from "@/components/admin/users/user-actions";
import { getUserDetail } from "@/lib/data/admin-users";
import { requireAdmin } from "@/lib/auth";
import { ENTITLEMENT_LABELS, type EntitlementKey } from "@/lib/access/policy";
import { cn, formatDateTime, formatNumber, formatVND, initials, timeAgo } from "@/lib/utils";

export const metadata = { title: "Chi tiết người dùng" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [actor, detail] = await Promise.all([requireAdmin(), getUserDetail(id)]);
  if (!detail) notFound();
  const { profile, businesses, orders, payments, credits, entitlements, activity, affiliate, subscriptions, referrer } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/admin/users" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft className="size-3" /> Người dùng</Link>}
        title={profile.full_name || profile.email}
        description={profile.email}
        actions={<UserActions userId={profile.id} email={profile.email} role={profile.role} status={profile.status} credits={profile.credits} isSelf={actor.id === profile.id} actorIsSuper={actor.role === "super_admin"} />}
      />

      {profile.status === "suspended" ? (
        <Alert variant="destructive">
          <AlertTitle>Tài khoản đang bị tạm khoá</AlertTitle>
          <AlertDescription>
            <p>Từ {formatDateTime(profile.suspended_at)}{profile.suspended_reason ? ` — Lý do: ${profile.suspended_reason}` : ""}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate">{profile.full_name || "Chưa đặt tên"}</CardTitle>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <StatusBadge kind="role" value={profile.role} />
                  <StatusBadge kind="user" value={profile.status} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Email", value: <span className="break-all">{profile.email}</span> },
                { label: "Số điện thoại", value: profile.phone || "—" },
                { label: "Credits", value: <span className="tabular-nums">{formatNumber(profile.credits)}</span> },
                { label: "Mã giới thiệu", value: <code className="font-mono text-xs">{profile.referral_code}</code> },
                { label: "Được giới thiệu bởi", value: referrer ? <Link href={`/admin/users/${referrer.id}`} className="hover:underline">{referrer.full_name || referrer.email}</Link> : "—" },
                { label: "Affiliate", value: affiliate ? <span className="inline-flex items-center gap-1.5"><code className="font-mono text-xs">{affiliate.code}</code><StatusBadge kind="affiliate" value={affiliate.status} /></span> : "—" },
                { label: "Đăng ký", value: formatDateTime(profile.created_at) },
                { label: "Hoạt động cuối", value: profile.last_seen_at ? `${timeAgo(profile.last_seen_at)}` : "—" },
                { label: "ID", value: <code className="font-mono text-[11px] text-muted-foreground">{profile.id}</code> },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <Tabs defaultValue="businesses">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="businesses"><Briefcase /> Business ({businesses.length})</TabsTrigger>
                <TabsTrigger value="orders"><ShoppingBag /> Đơn hàng ({orders.length})</TabsTrigger>
                <TabsTrigger value="payments"><Receipt /> Thanh toán ({payments.length})</TabsTrigger>
                <TabsTrigger value="credits"><Coins /> Credits ({credits.length})</TabsTrigger>
                <TabsTrigger value="entitlements"><KeyRound /> Quyền ({entitlements.length})</TabsTrigger>
                <TabsTrigger value="activity"><Activity /> Hoạt động</TabsTrigger>
              </TabsList>

              <TabsContent value="businesses">
                {businesses.length === 0 ? (
                  <EmptyState compact icon={Briefcase} title="Chưa có business" />
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Loại hình / ngành</TableHead><TableHead>Trạng thái</TableHead><TableHead>Tạo lúc</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {businesses.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell><Link href={`/admin/businesses/${b.id}`} className="font-medium hover:underline">{b.name}</Link></TableCell>
                          <TableCell className="text-muted-foreground">{b.business_types?.name ?? "—"}{b.industries?.name ? ` · ${b.industries.name}` : ""}</TableCell>
                          <TableCell><StatusBadge kind="business" value={b.status} /></TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(b.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="orders">
                {orders.length === 0 ? (
                  <EmptyState compact icon={ShoppingBag} title="Chưa có đơn hàng" />
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Tổng</TableHead><TableHead>Ngày</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link></TableCell>
                          <TableCell>{o.products?.name ?? "—"}</TableCell>
                          <TableCell><StatusBadge kind="order" value={o.status} /></TableCell>
                          <TableCell className="text-right tabular-nums">{formatVND(o.total)}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.paid_at ?? o.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="payments">
                {payments.length === 0 ? (
                  <EmptyState compact icon={Receipt} title="Chưa có giao dịch thanh toán" />
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Cổng</TableHead><TableHead>Mã tham chiếu</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Số tiền</TableHead><TableHead>Ngày</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell><Link href={`/admin/payments/${p.id}`} className="font-medium hover:underline">{p.provider}</Link></TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{p.provider_ref ?? "—"}</TableCell>
                          <TableCell><StatusBadge kind="payment" value={p.status} /></TableCell>
                          <TableCell className="text-right tabular-nums">{formatVND(p.amount)}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="credits">
                {credits.length === 0 ? (
                  <EmptyState compact icon={Coins} title="Chưa có giao dịch credits" />
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Thời gian</TableHead><TableHead>Lý do</TableHead><TableHead className="text-right">Thay đổi</TableHead><TableHead className="text-right">Số dư</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {credits.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(c.created_at)}</TableCell>
                          <TableCell>
                            <div>{c.reason}</div>
                            {c.ref_type ? <div className="text-xs text-muted-foreground">{c.ref_type}{c.ref_id ? ` · ${c.ref_id.slice(0, 8)}` : ""}</div> : null}
                          </TableCell>
                          <TableCell className={cn("text-right font-medium tabular-nums", c.amount >= 0 ? "text-success" : "text-destructive")}>{c.amount >= 0 ? `+${c.amount}` : c.amount}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.balance_after}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="entitlements">
                <div className="space-y-4">
                  {subscriptions.length ? (
                    <div className="rounded-lg border p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gói đăng ký</div>
                      <ul className="space-y-1 text-sm">
                        {subscriptions.map((s) => (
                          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                            <span>{s.products?.name ?? "—"} <StatusBadge kind="subscription" value={s.status} className="ml-1" /></span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(s.current_period_start)} → {formatDateTime(s.current_period_end)}{s.cancel_at_period_end ? " · huỷ cuối kỳ" : ""}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {entitlements.length === 0 ? (
                    <EmptyState compact icon={KeyRound} title="Chưa có quyền (entitlement) nào" description="Quyền được cấp khi mua sản phẩm hoặc do admin cấp." />
                  ) : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Quyền</TableHead><TableHead>Phạm vi</TableHead><TableHead>Nguồn</TableHead><TableHead>Hết hạn</TableHead><TableHead>Cấp lúc</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {entitlements.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell>
                              <div className="font-medium">{ENTITLEMENT_LABELS[e.key as EntitlementKey] ?? e.key}</div>
                              <code className="text-[11px] text-muted-foreground">{e.key}</code>
                            </TableCell>
                            <TableCell>{e.business_id ? <Link href={`/admin/businesses/${e.business_id}`} className="hover:underline">{e.businesses?.name ?? "Business"}</Link> : <Badge variant="outline">Tài khoản</Badge>}</TableCell>
                            <TableCell className="text-muted-foreground">{e.source}{e.products?.name ? ` · ${e.products.name}` : ""}{e.order_id ? <> · <Link href={`/admin/orders/${e.order_id}`} className="hover:underline">đơn</Link></> : null}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{e.expires_at ? formatDateTime(e.expires_at) : "Vĩnh viễn"}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(e.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                {activity.length === 0 ? (
                  <EmptyState compact icon={Activity} title="Chưa có hoạt động" />
                ) : (
                  <ul className="divide-y">
                    {activity.map((a) => (
                      <li key={a.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{a.title || a.action}</div>
                          <div className="text-xs text-muted-foreground">
                            <code>{a.action}</code>
                            {a.business_id ? <> · <Link href={`/admin/businesses/${a.business_id}`} className="hover:underline">business</Link></> : null}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground" title={formatDateTime(a.created_at)}>{timeAgo(a.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div>
        <Button asChild variant="ghost" size="sm"><Link href="/admin/users"><ArrowLeft /> Quay lại danh sách</Link></Button>
      </div>
    </div>
  );
}
