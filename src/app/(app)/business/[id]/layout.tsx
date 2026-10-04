import Link from "next/link";
import { Download, Settings, Share2 } from "lucide-react";
import { getBusinessOrNotFound } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LABELS } from "@/lib/access/policy";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import * as React from "react";
import { GeneratingBanner } from "@/components/workspace/generating-banner";

export default async function BusinessLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, ctx] = await Promise.all([getBusinessOrNotFound(id), getAccessContext(id)]);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard/businesses" className="hover:underline">Business của tôi</Link>
            <span>/</span>
            <span className="truncate">{business.business_types?.name ?? "Business"}{business.industries ? ` · ${business.industries.name}` : ""}</span>
          </div>
          <h1 className="mt-0.5 flex flex-wrap items-center gap-2 text-xl font-bold sm:text-2xl">
            {business.name}
            <Badge variant={ctx.plan === "free" ? "secondary" : "premium"}>{PLAN_LABELS[ctx.plan]}</Badge>
            {business.status === "archived" ? <Badge variant="warning">Đã lưu trữ</Badge> : null}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href={`/business/${id}/downloads`}><Download /> Tải xuống</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href={`/business/${id}/settings#share`}><Share2 /> Chia sẻ</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href={`/business/${id}/settings`}><Settings /> Cài đặt</Link></Button>
        </div>
      </div>
      {business.status === "generating" || business.status === "draft" ? <GeneratingBanner businessId={id} status={business.status} /> : null}
      {children}
      <React.Suspense><AnalyticsTracker event="workspace_preview" properties={{ business_id: id }} /></React.Suspense>
    </div>
  );
}
