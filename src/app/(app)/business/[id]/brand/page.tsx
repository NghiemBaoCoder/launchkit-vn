import { getBusinessAssets } from "@/lib/data/business";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { AssetCard } from "@/components/workspace/asset-card";
import { RegenerateButton } from "@/components/workspace/regenerate-button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Thương hiệu" };

const ORDER = ["positioning", "value_proposition", "tagline", "description", "voice", "persona", "key_messages", "palette", "typography", "analysis"];
const DESCRIPTIONS: Record<string, string> = {
  positioning: "Bạn là ai, cho ai, khác gì — nền tảng cho mọi nội dung khác.",
  value_proposition: "Lời hứa giá trị và 3 trụ cột chứng minh.",
  tagline: "Chọn 1 trong các phương án hoặc tự viết.",
  description: "Dùng cho bio Facebook/Instagram, giới thiệu trên website.",
  voice: "Cách nói chuyện nhất quán trên mọi kênh.",
  persona: "Chân dung khách hàng lý tưởng để viết đúng insight.",
  key_messages: "4 thông điệp lặp lại trong mọi nội dung.",
  palette: "Bảng màu dùng cho logo, website, bài đăng.",
  typography: "Cặp font tiêu đề / nội dung.",
  analysis: "Phân tích ban đầu từ câu trả lời onboarding.",
};

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, ctx] = await Promise.all([getBusinessAssets(id, "brand"), getAccessContext(id)]);
  const sorted = [...assets].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const freeRegen = can(ctx, "generation.regenerate_free");

  return (
    <div className="space-y-6">
      <PageHeader title="Thương hiệu" description="Định vị, giá trị, giọng nói và nhận diện của business." actions={assets.length ? <RegenerateButton businessId={id} stage="brand" label="Tạo lại toàn bộ thương hiệu" freeRegeneration={freeRegen} /> : null} />
      {sorted.length === 0 ? (
        <EmptyState icon={Sparkles} title="Chưa có nội dung thương hiệu" description="Chạy trình tạo Business Kit để có định vị, tagline, giọng nói và chân dung khách hàng." action={<Button asChild><Link href={`/generate/${id}`}>Tạo Business Kit</Link></Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((a) => (
            <AssetCard
              key={a.id}
              asset={a}
              businessId={id}
              stage="brand"
              freeRegeneration={freeRegen}
              description={DESCRIPTIONS[a.key]}
              className={a.key === "analysis" || a.key === "persona" || a.key === "key_messages" ? "lg:col-span-2" : undefined}
              view={a.key === "palette" ? "palette" : a.key === "tagline" ? "tagline" : a.key === "typography" ? "typography" : "default"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
