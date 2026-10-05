import Link from "next/link";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { listBusinesses, parseBusinessFilters } from "@/lib/data/admin-businesses";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/utils";

export const metadata = { title: "Business" };

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseBusinessFilters(sp);
  const result = await listBusinesses(filters);
  const hasFilter = Boolean(filters.q || filters.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Business" description={`${formatNumber(result.total)} business${hasFilter ? " khớp bộ lọc" : ""} do khách hàng tạo.`} />
      <DataTableToolbar searchPlaceholder="Tìm theo tên hoặc slug…" filters={[{ name: "status", label: "Trạng thái", options: statusOptions("business") }]} />
      {result.items.length === 0 ? (
        <EmptyState icon={Briefcase} title={hasFilter ? "Không có business khớp bộ lọc" : "Chưa có business"} description={hasFilter ? "Thử từ khoá khác hoặc xoá bộ lọc." : "Business sẽ xuất hiện khi khách hoàn tất onboarding."} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Chủ sở hữu</TableHead>
                <TableHead>Loại hình / ngành</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tạo lúc</TableHead>
                <TableHead>Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="max-w-[260px]">
                    <Link href={`/admin/businesses/${b.id}`} className="block truncate font-medium hover:underline">{b.name}</Link>
                    <div className="truncate text-xs text-muted-foreground">/{b.slug}</div>
                  </TableCell>
                  <TableCell className="max-w-[240px]"><UserLink id={b.user_id} email={b.profiles?.email} name={b.profiles?.full_name} /></TableCell>
                  <TableCell className="text-muted-foreground">{b.business_types?.name ?? "—"}{b.industries?.name ? ` · ${b.industries.name}` : ""}</TableCell>
                  <TableCell><StatusBadge kind="business" value={b.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(b.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{timeAgo(b.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/businesses", sp)} />
    </div>
  );
}
