import Link from "next/link";
import { ArrowRight, Briefcase, Coins, Download, Plus, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { PLAN_LABELS, can } from "@/lib/access/policy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatVND, initials, timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const STATUS_LABEL: Record<string, string> = { draft: "Nháp", generating: "Đang tạo", ready: "Sẵn sàng", archived: "Lưu trữ" };

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }));
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default async function DashboardPage() {
  const [profile, ctx, supabase] = await Promise.all([requireProfile(), getAccessContext(), createClient()]);
  const [{ data: businesses }, { data: orders }, { data: activity }, { data: exports }, { count: downloads }] = await Promise.all([
    supabase.from("businesses").select("id, name, status, logo_url, updated_at, business_types(name)").eq("user_id", profile.id).neq("status", "archived").order("updated_at", { ascending: false }).limit(6),
    supabase.from("orders").select("id, order_number, status, total, paid_at, created_at, business_id, products(name)").eq("user_id", profile.id).eq("status", "paid").order("paid_at", { ascending: false }).limit(5),
    supabase.from("activity_logs").select("id, action, title, created_at, business_id").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("exports").select("id, title, format, status, created_at, business_id").eq("user_id", profile.id).eq("status", "ready").order("created_at", { ascending: false }).limit(5),
    supabase.from("downloads").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);
  const biz = businesses ?? [];
  const primary = biz[0];
  const canCreateMore = can(ctx, "business.multiple") || biz.length < 1;
  const firstName = (profile.full_name ?? "").trim().split(/\s+/).pop() || "bạn";

  const nextActions: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];
  if (biz.length === 0) nextActions.push({ label: "Tạo Business Kit đầu tiên", href: "/onboarding", icon: Sparkles });
  if (primary?.status === "draft") nextActions.push({ label: `Chạy trình tạo cho "${primary.name}"`, href: `/generate/${primary.id}`, icon: Zap });
  if (primary?.status === "ready" && ctx.plan === "free") nextActions.push({ label: "Mở khoá toàn bộ Business Kit", href: `/checkout/business-kit?business=${primary.id}`, icon: Sparkles });
  if (primary?.status === "ready") nextActions.push({ label: "Xuất Business Kit ra PDF", href: `/business/${primary.id}/downloads`, icon: Download });
  if (primary) nextActions.push({ label: "Lên lịch nội dung tuần này", href: `/business/${primary.id}/content`, icon: ArrowRight });
  if (profile.credits <= 1) nextActions.push({ label: "Credits sắp hết — nâng cấp để tạo lại nội dung", href: "/pricing", icon: Coins });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{firstName} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gói hiện tại: <Badge variant={ctx.plan === "free" ? "secondary" : "premium"}>{PLAN_LABELS[ctx.plan]}</Badge></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreateMore ? <Button asChild><Link href="/onboarding"><Plus /> Tạo business</Link></Button> : null}
          {primary?.status === "draft" ? <Button asChild variant="outline"><Link href={`/generate/${primary.id}`}><Zap /> Tiếp tục thiết lập</Link></Button> : null}
          {primary && primary.status !== "draft" ? <Button asChild variant="outline"><Link href={`/business/${primary.id}/overview`}><Briefcase /> Mở workspace</Link></Button> : null}
          {primary ? <Button asChild variant="outline"><Link href={`/business/${primary.id}/downloads`}><Download /> Tải kit</Link></Button> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Business" value={biz.length} icon={Briefcase} hint={biz.length ? `${biz.filter((b) => b.status === "ready").length} sẵn sàng` : "Chưa có"} />
        <StatCard label="Credits tạo nội dung" value={profile.credits} icon={Coins} hint={profile.credits <= 1 ? <Link href="/pricing" className="text-primary hover:underline">Mua thêm</Link> : "1 credit / lần tạo"} />
        <StatCard label="Kit đã mua" value={orders?.length ?? 0} icon={ShoppingBag} hint={<Link href="/dashboard/purchases" className="hover:underline">Xem đơn hàng</Link>} />
        <StatCard label="Lượt tải xuống" value={downloads ?? 0} icon={Download} hint={`${exports?.length ?? 0} file sẵn sàng`} />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle>Business của tôi</CardTitle><CardDescription>Mở workspace để chỉnh sửa</CardDescription></div>
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard/businesses">Tất cả <ArrowRight /></Link></Button>
            </CardHeader>
            <CardContent>
              {biz.length === 0 ? (
                <EmptyState compact icon={Briefcase} title="Chưa có business" description="Trả lời 10 câu hỏi để nhận bộ Business Kit hoàn chỉnh." action={<Button asChild><Link href="/onboarding"><Sparkles /> Tạo Business Kit</Link></Button>} />
              ) : (
                <ul className="divide-y">
                  {biz.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 py-3">
                      <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-xs font-bold text-primary">{b.logo_url ? <img src={b.logo_url} alt="" className="size-full object-cover" /> : initials(b.name)}</span>
                      <div className="min-w-0 flex-1"><Link href={`/business/${b.id}/overview`} className="block truncate font-medium hover:text-primary">{b.name}</Link><div className="text-xs text-muted-foreground">{b.business_types?.name ?? ""} · {STATUS_LABEL[b.status] ?? b.status} · {timeAgo(b.updated_at)}</div></div>
                      <Button asChild size="sm" variant={b.status === "draft" ? "default" : "outline"}><Link href={b.status === "draft" || b.status === "generating" ? `/generate/${b.id}` : `/business/${b.id}/overview`}>{b.status === "draft" ? "Tiếp tục" : b.status === "generating" ? "Tiến trình" : "Mở"}</Link></Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Hoạt động gần đây</CardTitle></CardHeader>
            <CardContent>
              {!activity?.length ? <p className="text-sm text-muted-foreground">Chưa có hoạt động. Hãy tạo business đầu tiên.</p> : (
                <ul className="space-y-3">{activity.map((a) => (<li key={a.id} className="flex items-start gap-3 text-sm"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /><span className="min-w-0 flex-1"><span className="block truncate">{a.title ?? a.action}</span><span className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</span></span>{a.business_id ? <Link href={`/business/${a.business_id}/overview`} className="text-xs text-primary hover:underline">Mở</Link> : null}</li>))}</ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader><CardTitle>Việc nên làm tiếp</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1">{nextActions.slice(0, 4).map((a) => (<li key={a.href + a.label}><Link href={a.href} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-background"><a.icon className="size-4 text-primary" /><span className="flex-1">{a.label}</span><ArrowRight className="size-3.5 text-muted-foreground" /></Link></li>))}</ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Kit đã mua</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/dashboard/purchases">Xem</Link></Button></CardHeader>
            <CardContent>
              {!orders?.length ? <EmptyState compact icon={ShoppingBag} title="Chưa mua kit nào" description="Mở khoá Business Kit để dùng đầy đủ." action={<Button asChild size="sm" variant="outline"><Link href="/pricing">Xem bảng giá</Link></Button>} /> : (
                <ul className="divide-y text-sm">{orders.map((o) => (<li key={o.id} className="flex items-center justify-between py-2"><div><div className="font-medium">{o.products?.name}</div><div className="text-xs text-muted-foreground">{o.order_number} · {timeAgo(o.paid_at ?? o.created_at)}</div></div><span className="font-semibold">{formatVND(o.total)}</span></li>))}</ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Tải xuống</CardTitle></CardHeader>
            <CardContent>
              {!exports?.length ? <p className="text-sm text-muted-foreground">Chưa có file nào. Xuất kit từ workspace → Tải xuống.</p> : (
                <ul className="divide-y text-sm">{exports.map((e) => (<li key={e.id} className="flex items-center justify-between gap-2 py-2"><div className="min-w-0"><div className="truncate font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.format.toUpperCase()} · {timeAgo(e.created_at)}</div></div><Button asChild size="sm" variant="outline"><a href={`/api/exports/${e.id}/download`} target="_blank" rel="noreferrer"><Download /></a></Button></li>))}</ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
