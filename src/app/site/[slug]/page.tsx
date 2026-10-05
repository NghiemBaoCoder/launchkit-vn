import type { Metadata } from "next";
import Link from "next/link";
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteRenderer, type SiteContact, type SiteTheme } from "@/components/site-template/site-renderer";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import type { WebsiteSection } from "@/lib/ai/types";
import { SITE } from "@/lib/constants";

interface PublicSite { business: { id: string; name: string; logo_url: string | null; location: string | null }; site: { slug: string; sections: WebsiteSection[]; theme: SiteTheme; contact: SiteContact; published_at: string | null } }

async function loadSite(slug: string): Promise<PublicSite | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_site", { p_slug: slug });
  return (data as PublicSite | null) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSite(slug);
  if (!data) return { title: "Không tìm thấy trang" };
  const hero = data.site.sections.find((s) => s.type === "hero")?.data as { title?: string; subtitle?: string } | undefined;
  return { title: `${data.business.name} — ${hero?.title ?? "Website"}`, description: hero?.subtitle, robots: { index: true } };
}

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadSite(slug);
  if (!data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Trang này chưa được xuất bản</h1>
        <p className="mt-2 max-w-md text-muted-foreground">Chủ website chưa bật chế độ public hoặc đường dẫn không đúng.</p>
        <Link href="/" className="mt-6 text-sm text-primary hover:underline">Tạo website của bạn với {SITE.name} →</Link>
      </div>
    );
  }
  return (
    <>
      <SiteRenderer business={data.business} sections={data.site.sections} theme={data.site.theme} contact={data.site.contact} />
      <div className="bg-white py-3 text-center text-xs text-slate-400">Tạo bởi <Link href="/" className="font-medium text-slate-600 hover:underline">{SITE.name}</Link></div>
      <React.Suspense><AnalyticsTracker event="site_view" properties={{ slug }} /></React.Suspense>
    </>
  );
}
