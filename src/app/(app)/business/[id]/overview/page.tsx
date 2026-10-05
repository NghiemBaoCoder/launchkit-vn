import Link from "next/link";
import { ArrowRight, CalendarDays, Download, FileText, Globe, Pencil, Sparkles, Tags, Target } from "lucide-react";
import { getBusinessAssets, getBusinessCompletion, getBusinessOrNotFound } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistItemToggle } from "@/components/workspace/checklist-item-toggle";
import { formatVND, timeAgo, formatDate } from "@/lib/utils";
import { onboardingAnswersSchema } from "@/lib/onboarding/schema";
import { WORKSPACE_SECTIONS } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { PLAN_LABELS } from "@/lib/access/policy";

export const metadata = { title: "Tổng quan" };

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, ctx, completion, assets, supabase] = await Promise.all([getBusinessOrNotFound(id), getAccessContext(id), getBusinessCompletion(id), getBusinessAssets(id), createClient()]);
  const [{ data: answersRow }, { data: launch }, { data: activity }, { data: services }] = await Promise.all([
    supabase.from("business_answers").select("answers").eq("business_id", id).maybeSingle(),
    supabase.from("checklists").select("id, title, checklist_items(id, title, description, done, sort_order)").eq("business_id", id).eq("kind", "launch").maybeSingle(),
    supabase.from("activity_logs").select("id, action, title, created_at").eq("business_id", id).order("created_at", { ascending: false }).limit(8),
    supabase.from("services").select("id, name, price, sale_price, unit").eq("business_id", id).order("sort_order").limit(4),
  ]);
  const answers = onboardingAnswersSchema.safeParse(answersRow?.answers ?? {});
  const tagline = (assets.find((a) => a.key === "tagline")?.content as { selected?: string } | undefined)?.selected;
  const analysis = assets.find((a) => a.key === "analysis")?.content as { recommended_focus?: string; summary?: string } | undefined;
  const recentAssets = [...assets].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6);
  const launchItems = (launch?.checklist_items ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const launchDone = launchItems.filter((i) => i.done).length;
  const nextActions = completion.items.filter((i) => !i.done).slice(0, 4);

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle>Mức độ hoàn thiện</CardTitle><CardDescription>Dựa trên dữ liệu thực tế của business</CardDescription></div>
            <div className="text-3xl font-bold text-primary">{completion.percent}%</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completion.percent} />
            <div className="grid gap-2 sm:grid-cols-2">
              {completion.items.map((i) => (
                <Link key={i.key} href={`/business/${id}/${i.href}`} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent/50">
                  <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${i.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>{i.done ? "✓" : "•"}</span>
                  <span className={i.done ? "text-muted-foreground" : ""}>{i.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hành động đề xuất</CardTitle><CardDescription>{analysis?.recommended_focus ?? "Hoàn thành các mục còn thiếu để kit sẵn sàng sử dụng."}</CardDescription></CardHeader>
          <CardContent>
            {nextActions.length === 0 ? (
              <EmptyState compact title="Business của bạn đã hoàn thiện 🎉" description="Hãy xuất Business Kit hoặc chia sẻ với đối tác." action={<Button asChild><Link href={`/business/${id}/downloads`}><Download /> Xuất kit</Link></Button>} />
            ) : (
              <ul className="divide-y">
                {nextActions.map((a) => (
                  <li key={a.key}><Link href={`/business/${id}/${a.href}`} className="flex items-center justify-between py-3 text-sm hover:text-primary"><span>{a.label}</span><ArrowRight className="size-4" /></Link></li>
                ))}
                {ctx.plan === "free" ? <li><Link href={`/checkout/business-kit?business=${id}`} className="flex items-center justify-between py-3 text-sm text-primary"><span className="flex items-center gap-2"><Sparkles className="size-4" /> Mở khoá toàn bộ Business Kit (kịch bản, marketing, nội dung, tài liệu…)</span><ArrowRight className="size-4" /></Link></li> : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle>Checklist ra mắt</CardTitle><CardDescription>{launchItems.length ? `${launchDone}/${launchItems.length} việc đã xong` : "Chưa có checklist"}</CardDescription></div>
            <Button asChild variant="ghost" size="sm"><Link href={`/business/${id}/operations`}>Xem tất cả <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            {launchItems.length === 0 ? (
              <EmptyState compact title="Chưa có checklist" description="Tạo Business Kit để có checklist ra mắt." action={<Button asChild variant="outline"><Link href={`/generate/${id}`}>Tạo ngay</Link></Button>} />
            ) : (
              <div className="space-y-0.5">{launchItems.slice(0, 6).map((it) => <ChecklistItemToggle key={it.id} id={it.id} title={it.title} done={it.done} description={it.description} />)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Nội dung mới cập nhật</CardTitle></CardHeader>
          <CardContent>
            {recentAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có nội dung nào.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {recentAssets.map((a) => (
                  <li key={a.id}><Link href={`/business/${id}/${a.category}#asset-${a.key}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-accent/50"><span className="truncate">{a.title}</span><span className="shrink-0 text-xs text-muted-foreground">v{a.version} · {timeAgo(a.updated_at)}</span></Link></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader><CardTitle>Ảnh chụp business</CardTitle>{tagline ? <CardDescription className="italic">“{tagline}”</CardDescription> : null}</CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Loại hình" value={business.business_types?.name} />
            <Row label="Ngành" value={business.industries?.name} />
            <Row label="Khu vực" value={business.location} />
            <Row label="Gói" value={<Badge variant={ctx.plan === "free" ? "secondary" : "premium"}>{PLAN_LABELS[ctx.plan]}</Badge>} />
            {answers.success ? (
              <>
                <Row label="Khách hàng" value={answers.data.targetCustomer} />
                <Row label="Mục tiêu doanh thu" value={`${formatVND(answers.data.revenueTarget)}/tháng`} />
                <Row label="Kênh bán" value={answers.data.salesChannels.join(", ")} />
              </>
            ) : null}
            <Row label="Tạo lúc" value={formatDate(business.created_at)} />
            {services?.length ? (
              <div className="pt-2">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dịch vụ</div>
                <ul className="space-y-1">{services.map((s) => <li key={s.id} className="flex justify-between gap-2"><span className="truncate">{s.name}</span><span className="shrink-0 font-medium">{formatVND(s.sale_price ?? s.price)}</span></li>)}</ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Thao tác nhanh</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <QuickLink href={`/business/${id}/brand`} icon={Sparkles} label="Thương hiệu" />
            <QuickLink href={`/business/${id}/pricing`} icon={Tags} label="Bảng giá" />
            <QuickLink href={`/business/${id}/content`} icon={CalendarDays} label="Nội dung" />
            <QuickLink href={`/business/${id}/website`} icon={Globe} label="Website" />
            <QuickLink href={`/business/${id}/documents`} icon={FileText} label="Tài liệu" />
            <QuickLink href={`/business/${id}/downloads`} icon={Download} label="Tải xuống" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Chỉnh sửa gần đây</CardTitle></CardHeader>
          <CardContent>
            {!activity?.length ? (
              <p className="text-sm text-muted-foreground">Chưa có hoạt động.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-2 text-sm"><Pencil className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><span className="min-w-0"><span className="block truncate">{a.title ?? a.action}</span><span className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</span></span></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="size-4" /> Các mục trong kit</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {WORKSPACE_SECTIONS.filter((s) => s.key !== "overview" && s.key !== "settings" && s.key !== "downloads").map((s) => (
              <Button key={s.key} asChild variant="outline" size="sm"><Link href={`/business/${id}/${s.key}`}>{s.label}</Link></Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3"><span className="shrink-0 text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent/50"><Icon className="size-4 text-primary" />{label}</Link>
  );
}
