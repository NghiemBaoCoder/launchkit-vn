import { getBusinessAssets } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { can, FREE_PREVIEW } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { AssetCard } from "@/components/workspace/asset-card";
import { PremiumGate } from "@/components/workspace/premium-gate";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Bán hàng" };

const ORDER = ["elevator_pitch", "short_message", "long_message", "consultation_script", "discovery_questions", "objections", "follow_up", "closing"];
const FREE_KEYS = new Set(["elevator_pitch", "short_message"]);
const DESCRIPTIONS: Record<string, string> = {
  elevator_pitch: "Giới thiệu 30 giây khi gặp khách lần đầu.",
  short_message: "Nhắn Zalo/Facebook — ngắn, có câu hỏi kết thúc.",
  long_message: "Email hoặc tin nhắn chi tiết sau khi khách quan tâm.",
  consultation_script: "Kịch bản tư vấn 20–30 phút theo từng giai đoạn.",
  discovery_questions: "Câu hỏi khám phá nhu cầu trước khi đề xuất.",
  objections: "Cách trả lời các lý do từ chối thường gặp.",
  follow_up: "Chuỗi theo dõi 30 ngày — mỗi lần mang thêm giá trị.",
  closing: "Câu chốt cho từng tình huống.",
};

export default async function SalesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, ctx] = await Promise.all([getBusinessAssets(id, "sales"), getAccessContext(id)]);
  const sorted = [...assets].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const freeRegen = can(ctx, "generation.regenerate_free");
  const full = can(ctx, "sales.full");
  const freeAssets = sorted.filter((a) => FREE_KEYS.has(a.key));
  const premiumAssets = sorted.filter((a) => !FREE_KEYS.has(a.key));
  const objections = sorted.find((a) => a.key === "objections")?.content as { items?: { objection: string; response: string }[] } | undefined;

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bán hàng" description="Kịch bản tư vấn, xử lý từ chối, follow-up và câu chốt." />
        <EmptyState icon={MessageSquare} title="Chưa có kịch bản bán hàng" description="Chạy trình tạo Business Kit để có bộ kịch bản đầy đủ." action={<Button asChild><Link href={`/generate/${id}`}>Tạo Business Kit</Link></Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bán hàng" description="Mọi nội dung đều sao chép, sửa, lưu, tạo lại và xem lịch sử được." actions={<RegenerateButton businessId={id} stage="sales" label="Tạo lại kịch bản" freeRegeneration={freeRegen} />} />
      <div className="grid gap-4 lg:grid-cols-2">
        {freeAssets.map((a) => <AssetCard key={a.id} asset={a} businessId={id} stage="sales" freeRegeneration={freeRegen} description={DESCRIPTIONS[a.key]} />)}
      </div>
      <PremiumGate
        ctx={ctx}
        feature="sales.full"
        businessId={id}
        title="Bộ kịch bản bán hàng đầy đủ"
        description="Kịch bản tư vấn theo từng giai đoạn, 7 câu hỏi khám phá, 6 cách xử lý từ chối, chuỗi follow-up 30 ngày và 5 câu chốt."
        benefits={["Kịch bản tư vấn 6 giai đoạn có lời thoại", "6 tình huống từ chối + cách trả lời", "Follow-up 30 ngày & câu chốt theo tình huống"]}
        teaserLines={8}
        preview={!full && objections?.items?.length ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Xử lý từ chối — xem trước {FREE_PREVIEW.objectionsVisible}/{objections.items.length}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {objections.items.slice(0, FREE_PREVIEW.objectionsVisible).map((o, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-3 text-sm"><div className="font-medium">“{o.objection}”</div><p className="mt-1 text-muted-foreground">{o.response}</p></div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {premiumAssets.map((a) => <AssetCard key={a.id} asset={a} businessId={id} stage="sales" freeRegeneration={freeRegen} description={DESCRIPTIONS[a.key]} className={a.key === "consultation_script" || a.key === "objections" || a.key === "follow_up" ? "lg:col-span-2" : undefined} />)}
        </div>
      </PremiumGate>
    </div>
  );
}
