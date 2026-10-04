import Link from "next/link";
import { ArrowRight, Briefcase, Coins, Cpu, Percent, Receipt, ShoppingBag, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodSelector } from "@/components/admin/period-selector";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { StatusBadge } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { getDashboardStats, getFunnelStats, getRecentOrders, getRecentUsers, trendOf } from "@/lib/data/admin-dashboard";
import { paramDays, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber, formatPercent, formatVND, timeAgo } from "@/lib/utils";

export const metadata = { title: "Tổng quan" };

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const days = paramDays(sp);
  const [stats, funnel, recentOrders, recentUsers] = await Promise.all([getDashboardStats(days), getFunnelStats(days), getRecentOrders(5), getRecentUsers(5)]);
  const period = `${days} ngày qua`;

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" description={`Tình hình kinh doanh trong ${period}.`} actions={<PeriodSelector days={days} basePath="/admin" />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu" value={formatVND(stats.revenue)} icon={Receipt} trend={trendOf(stats.revenue, stats.revenue_prev)} hint={`so với kỳ trước (${formatVND(stats.revenue_prev)})`} />
        <StatCard label="Đơn hàng" value={formatNumber(stats.orders)} icon={ShoppingBag} trend={trendOf(stats.orders, stats.orders_prev)} hint={`${formatNumber(stats.paid_orders)} đã thanh toán`} />
        <StatCard label="Người dùng mới" value={formatNumber(stats.new_users)} icon={Users} trend={trendOf(stats.new_users, stats.new_users_prev)} hint={`tổng ${formatNumber(stats.users)} tài khoản`} />
        <StatCard label="Business" value={formatNumber(stats.businesses)} icon={Briefcase} hint={`+${formatNumber(stats.new_businesses)} trong ${period}`} />
        <StatCard label="Tỷ lệ chuyển đổi" value={formatPercent(stats.conversion)} icon={Percent} hint="người mua / người đăng ký mới" />
        <StatCard label="Giá trị đơn TB (AOV)" value={formatVND(Math.round(stats.aov))} icon={Coins} hint="trên đơn đã thanh toán" />
        <StatCard label="Generation" value={formatNumber(stats.generations)} icon={Cpu} hint={`${formatNumber(stats.generation_credits)} credits · ${formatNumber(stats.generation_failed)} lỗi`} className="xl:col-span-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo ngày</CardTitle>
          <CardDescription>Tổng giá trị đơn đã thanh toán mỗi ngày trong {period}.</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={stats.revenue_series} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>5 đơn mới nhất.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/orders">Tất cả <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState compact icon={ShoppingBag} title="Chưa có đơn hàng" description="Đơn hàng sẽ hiển thị tại đây khi khách bắt đầu thanh toán." />
            ) : (
              <ul className="divide-y">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link>
                      <div className="truncate text-xs text-muted-foreground">{o.profiles?.email ?? "—"} · {timeAgo(o.created_at)}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-medium tabular-nums">{formatVND(o.total)}</span>
                      <StatusBadge kind="order" value={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>Người dùng mới</CardTitle>
              <CardDescription>5 tài khoản đăng ký gần nhất.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/users">Tất cả <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <EmptyState compact icon={Users} title="Chưa có người dùng" />
            ) : (
              <ul className="divide-y">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <UserLink id={u.id} email={u.email} name={u.full_name} />
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">{timeAgo(u.created_at)}</span>
                      <StatusBadge kind="role" value={u.role} />
                      {u.status !== "active" ? <StatusBadge kind="user" value={u.status} /> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ngành phổ biến</CardTitle>
            <CardDescription>Số business theo ngành (toàn thời gian).</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_industries.length === 0 ? (
              <EmptyState compact icon={Briefcase} title="Chưa có dữ liệu" />
            ) : (
              <RankList items={stats.top_industries.map((i) => ({ label: i.name, value: i.count, display: formatNumber(i.count) }))} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <CardDescription>Theo doanh thu đơn đã thanh toán (toàn thời gian).</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_products.length === 0 ? (
              <EmptyState compact icon={Receipt} title="Chưa có giao dịch" />
            ) : (
              <RankList items={stats.top_products.map((p) => ({ label: p.name, value: p.revenue, display: `${formatVND(p.revenue)} · ${formatNumber(p.count)} đơn` }))} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>Phễu chuyển đổi</CardTitle>
              <CardDescription>Từ lượt xem landing tới đơn đã thanh toán trong {period}.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm"><Link href={`/admin/analytics${days !== 30 ? `?days=${days}` : ""}`}>Chi tiết <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} compact />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RankList({ items }: { items: { label: string; value: number; display: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((it, idx) => (
        <li key={`${it.label}-${idx}`} className="text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium">{idx + 1}. {it.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{it.display}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.max(3, Math.round((it.value / max) * 100))}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
