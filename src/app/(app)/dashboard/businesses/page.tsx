import Link from "next/link";
import { ArrowUpDown, Briefcase, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessCardMenu } from "@/components/app/business-card-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initials, timeAgo } from "@/lib/utils";

export const metadata = { title: "Business của tôi" };

const STATUS_LABEL: Record<string, string> = { draft: "Nháp", generating: "Đang tạo", ready: "Sẵn sàng", archived: "Lưu trữ" };
const STATUS_VARIANT: Record<string, "secondary" | "info" | "success" | "warning"> = { draft: "secondary", generating: "info", ready: "success", archived: "warning" };

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; sort?: string }> }) {
  const sp = await searchParams;
  const [profile, ctx, supabase] = await Promise.all([requireProfile(), getAccessContext(), createClient()]);
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "active";
  const sort = sp.sort ?? "updated";
  let query = supabase.from("businesses").select("*, business_types(name), industries(name)").eq("user_id", profile.id);
  if (q) query = query.ilike("name", `%${q}%`);
  if (status === "active") query = query.neq("status", "archived");
  else if (status !== "all") query = query.eq("status", status as "draft" | "generating" | "ready" | "archived");
  if (sort === "name") query = query.order("name");
  else if (sort === "created") query = query.order("created_at", { ascending: false });
  else query = query.order("updated_at", { ascending: false });
  const { data: businesses } = await query;
  const { count: activeCount } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).neq("status", "archived");
  const canCreateMore = can(ctx, "business.multiple") || (activeCount ?? 0) < 1;
  const list = businesses ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader title="Business của tôi" description="Tất cả business bạn đã tạo. Mở workspace để chỉnh sửa và xuất kit." actions={canCreateMore ? <Button asChild><Link href="/onboarding"><Plus /> Tạo business</Link></Button> : <Button asChild variant="premium"><Link href="/pricing">Nâng cấp để tạo thêm</Link></Button>} />
      {!canCreateMore ? <Alert variant="info"><AlertDescription>Gói miễn phí có 1 business đang hoạt động. Lưu trữ business hiện tại hoặc nâng cấp Pro Membership để tạo thêm.</AlertDescription></Alert> : null}
      <form className="flex flex-wrap items-center gap-2" method="GET">
        <div className="relative min-w-56 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Tìm theo tên…" className="pl-9" /></div>
        <Select name="status" defaultValue={status} className="w-40"><option value="active">Đang hoạt động</option><option value="ready">Sẵn sàng</option><option value="generating">Đang tạo</option><option value="draft">Nháp</option><option value="archived">Lưu trữ</option><option value="all">Tất cả</option></Select>
        <Select name="sort" defaultValue={sort} className="w-44"><option value="updated">Mới cập nhật</option><option value="created">Mới tạo</option><option value="name">Tên A→Z</option></Select>
        <Button type="submit" variant="outline"><ArrowUpDown /> Áp dụng</Button>
      </form>
      {list.length === 0 ? (
        q || status !== "active" ? (
          <EmptyState icon={Search} title="Không có business khớp bộ lọc" description="Thử từ khoá khác hoặc đổi trạng thái." action={<Button asChild variant="outline"><Link href="/dashboard/businesses">Xoá bộ lọc</Link></Button>} />
        ) : (
          <EmptyState icon={Briefcase} title="Bạn chưa có business nào" description="Tạo Business Kit đầu tiên trong 10 phút: thương hiệu, bảng giá, kịch bản bán hàng, marketing, nội dung, website và tài liệu." action={<Button asChild size="lg"><Link href="/onboarding"><Plus /> Tạo Business Kit</Link></Button>} />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <div key={b.id} className="group relative flex flex-col rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <Link href={`/business/${b.id}/overview`} className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-sm font-bold text-primary">{b.logo_url ? <img src={b.logo_url} alt="" className="size-full object-cover" /> : initials(b.name)}</Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/business/${b.id}/overview`} className="block truncate font-semibold hover:text-primary">{b.name}</Link>
                  <div className="truncate text-xs text-muted-foreground">{b.business_types?.name ?? "—"}{b.industries ? ` · ${b.industries.name}` : ""}</div>
                </div>
                <BusinessCardMenu id={b.id} name={b.name} status={b.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{STATUS_LABEL[b.status] ?? b.status}</Badge>
                <span>Cập nhật {timeAgo(b.updated_at)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                {b.status === "draft" ? <Button asChild size="sm" className="flex-1"><Link href={`/generate/${b.id}`}>Tiếp tục thiết lập</Link></Button> : b.status === "generating" ? <Button asChild size="sm" className="flex-1" variant="outline"><Link href={`/generate/${b.id}`}>Xem tiến trình</Link></Button> : <Button asChild size="sm" className="flex-1"><Link href={`/business/${b.id}/overview`}>Mở workspace</Link></Button>}
                <Button asChild size="sm" variant="outline"><Link href={`/business/${b.id}/downloads`}>Tải kit</Link></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
