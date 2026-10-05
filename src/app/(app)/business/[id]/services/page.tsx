import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { ServicesManager } from "@/components/workspace/services-manager";
import { RegenerateButton } from "@/components/workspace/regenerate-button";

export const metadata = { title: "Dịch vụ" };

export default async function ServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supabase, ctx] = await Promise.all([createClient(), getAccessContext(id)]);
  const { data: services } = await supabase.from("services").select("*").eq("business_id", id).order("sort_order");
  return (
    <div className="space-y-6">
      <PageHeader title="Dịch vụ" description="Đóng gói những gì bạn bán: tên, giá, hạng mục, lợi ích. Kéo để sắp xếp thứ tự hiển thị." actions={<RegenerateButton businessId={id} stage="services" label="Tạo lại dịch vụ" warning="Toàn bộ dịch vụ hiện tại sẽ bị thay thế bằng bộ dịch vụ mới do máy gợi ý." freeRegeneration={can(ctx, "generation.regenerate_free")} />} />
      <ServicesManager businessId={id} services={services ?? []} />
    </div>
  );
}
