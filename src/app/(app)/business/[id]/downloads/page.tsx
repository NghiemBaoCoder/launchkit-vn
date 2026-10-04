import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { DownloadCenter } from "@/components/workspace/download-center";

export const metadata = { title: "Tải xuống" };

export default async function DownloadsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ctx, supabase] = await Promise.all([getAccessContext(id), createClient()]);
  const { data: exports } = await supabase.from("exports").select("*").eq("business_id", id).order("created_at", { ascending: false }).limit(50);
  return (
    <div className="space-y-6">
      <PageHeader title="Tải xuống" description="Xuất Business Kit ra PDF, Markdown, TXT, CSV hoặc ZIP trọn bộ. Mọi file được lưu trong lịch sử." />
      <DownloadCenter businessId={id} exports={exports ?? []} canBasic={can(ctx, "exports.basic")} canPremium={can(ctx, "exports.premium")} />
    </div>
  );
}
