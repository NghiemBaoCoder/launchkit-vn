import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { ContentManager } from "@/components/workspace/content-manager";

export const metadata = { title: "Nội dung" };

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, supabase] = await Promise.all([getAccessContext(id), createClient()]);
  const full = can(ctx, "content.full");
  const freeRegen = can(ctx, "generation.regenerate_free");
  const { data: items } = await supabase.from("content_items").select("*").eq("business_id", id).order("scheduled_date", { ascending: true, nullsFirst: false }).order("sort_order");
  const all = items ?? [];
  // Không gửi nội dung premium xuống client khi bị khoá
  const visible = full ? all : all.slice(0, FREE_PREVIEW.contentItemsVisible);
  const locked = full ? 0 : Math.max(0, all.length - visible.length);

  return (
    <div className="space-y-6">
      <PageHeader title="Nội dung" description="Lịch nội dung và thư viện bài đăng cho Facebook, TikTok, Instagram, Threads." actions={<RegenerateButton businessId={id} stage="content" label="Tạo lại 30 nội dung" warning="Các nội dung chưa đăng sẽ bị thay thế bằng bộ nội dung mới." freeRegeneration={freeRegen} />} />
      <React.Suspense>
        {full ? (
          <ContentManager businessId={id} items={all} />
        ) : (
          <PremiumGate ctx={ctx} feature="content.full" businessId={id} title={`Mở khoá ${locked} nội dung còn lại`} description="Gói miễn phí xem trước 5 nội dung. Business Kit có đủ 30 bài theo lịch 30 ngày, tạo lại không giới hạn số lần." benefits={["30 bài đa nền tảng theo lịch", "Hook · Caption · CTA sẵn sàng đăng", "Quản lý trạng thái Ý tưởng → Đã đăng"]} teaserLines={6} preview={<ContentManager businessId={id} items={visible} lockedCount={locked} />}>
            <ContentManager businessId={id} items={all} />
          </PremiumGate>
        )}
      </React.Suspense>
    </div>
  );
}
