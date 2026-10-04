import { Coins, Layers, Percent, Receipt, Repeat, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodSelector } from "@/components/admin/period-selector";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { getDashboardStats, getFunnelStats } from "@/lib/data/admin-dashboard";
import { paramDays, type SearchParams } from "@/lib/data/admin-shared";
import { formatNumber, formatPercent, formatVND } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const days = paramDays(sp);
  const [stats, funnel] = await Promise.all([getDashboardStats(days), getFunnelStats(days)]);
  const topIndustry = stats.top_industries[0];
  const maxSource = Math.max(1, ...funnel.top_sources.map((s) => s.count));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description={`Phễu chuyển đổi và chỉ số tăng trưởng trong ${days} ngày qua.`} actions={<PeriodSelector days={days} basePath="/admin/analytics" />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tỷ lệ chuyển đổi" value={formatPercent(stats.conversion)} icon={Percent} hint="người mua / người đăng ký mới" />
        <StatCard label="Doanh thu" value={formatVND(stats.revenue)} icon={Receipt} hint={`${formatNumber(stats.paid_orders)} đơn đã thanh toán`} />
        <StatCard label="AOV" value={formatVND(Math.round(stats.aov))} icon={Coins} hint="giá trị trung bình mỗi đơn" />
        <StatCard label="Ngành dẫn đầu" value={topIndustry ? topIndustry.name : "—"} icon={Layers} hint={topIndustry ? `${formatNumber(topIndustry.count)} business` : "chưa có dữ liệu"} />
        <StatCard label="Kit → mua" value={formatPercent(funnel.kit_conversion)} icon={Sparkles} hint="business mới có đơn đã thanh toán" />
        <StatCard label="Khách mua lại" value={formatNumber(funnel.repeat_customers)} icon={Repeat} hint="tài khoản có > 1 đơn đã thanh toán" />
        <StatCard label="Người dùng mới" value={formatNumber(stats.new_users)} icon={Users} hint={`tổng ${formatNumber(stats.users)}`} />
        <StatCard label="Generation" value={formatNumber(stats.generations)} icon={Sparkles} hint={`${formatNumber(stats.generation_failed)} thất bại`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Phễu chuyển đổi</CardTitle>
            <CardDescription>Tỷ lệ bên phải là % chuyển đổi so với bước liền trước.</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nguồn truy cập</CardTitle>
            <CardDescription>Theo tham số nguồn của lượt xem landing.</CardDescription>
          </CardHeader>
          <CardContent>
            {funnel.top_sources.length === 0 ? (
              <EmptyState compact icon={Users} title="Chưa có lượt xem landing" description="Dữ liệu được ghi qua /api/track khi khách truy cập." />
            ) : (
              <ul className="space-y-2.5">
                {funnel.top_sources.map((s) => (
                  <li key={s.source} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{s.source}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatNumber(s.count)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <div className="h-full rounded-full bg-chart-2" style={{ width: `${Math.max(3, Math.round((s.count / maxSource) * 100))}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm theo doanh thu</CardTitle>
          <CardDescription>Toàn thời gian, chỉ tính đơn đã thanh toán.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.top_products.length === 0 ? (
            <EmptyState compact icon={Receipt} title="Chưa có giao dịch" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.top_products.map((p) => (
                <div key={p.name} className="rounded-lg border p-3">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="mt-1 text-lg font-bold tabular-nums">{formatVND(p.revenue)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(p.count)} đơn</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
