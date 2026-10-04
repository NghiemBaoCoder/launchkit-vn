import Link from "next/link";
import { Cpu } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { StageList, stageLabel } from "@/components/admin/stage-list";
import { UserLink } from "@/components/admin/user-link";
import { GenerationRowActions } from "@/components/admin/generations/generation-row-actions";
import { JOB_TYPES, listGenerations, parseGenerationFilters } from "@/lib/data/admin-generations";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/utils";

export const metadata = { title: "Generation" };

export default async function AdminGenerationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseGenerationFilters(sp);
  const result = await listGenerations(filters);
  const hasFilter = Boolean(filters.q || filters.status || filters.type);

  return (
    <div className="space-y-6">
      <PageHeader title="Generation" description={`${formatNumber(result.total)} phiên sinh nội dung${hasFilter ? " khớp bộ lọc" : ""}. Job thất bại có thể chạy lại tại đây.`} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo job/business ID, email, tên business, lỗi…"
        filters={[
          { name: "status", label: "Trạng thái", options: statusOptions("job") },
          { name: "type", label: "Loại", options: JOB_TYPES.map((t) => ({ value: t, label: t === "full" ? "Toàn bộ kit" : stageLabel(t) })) },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Cpu} title={hasFilter ? "Không có job khớp bộ lọc" : "Chưa có phiên sinh nội dung"} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business / người dùng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Stages</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Thời lượng</TableHead>
                <TableHead>Tạo lúc</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((row) => {
                const { profiles, businesses, ...job } = row;
                return (
                  <TableRow key={job.id}>
                    <TableCell className="max-w-[260px]">
                      <Link href={`/admin/businesses/${job.business_id}`} className="block truncate font-medium hover:underline">{businesses?.name ?? job.business_id.slice(0, 8)}</Link>
                      <UserLink id={job.user_id} email={profiles?.email} className="text-xs text-muted-foreground" />
                    </TableCell>
                    <TableCell><Badge variant="outline">{job.type === "full" ? "Toàn bộ" : stageLabel(job.type)}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{job.provider}{job.model ? <div className="max-w-[140px] truncate text-xs">{job.model}</div> : null}</TableCell>
                    <TableCell>
                      <StatusBadge kind="job" value={job.status} />
                      {job.error ? <div className="mt-0.5 max-w-[200px] truncate text-xs text-destructive" title={job.error}>{job.error}</div> : null}
                    </TableCell>
                    <TableCell className="min-w-[220px]"><StageList stages={job.stages} compact /></TableCell>
                    <TableCell className="text-right tabular-nums">{job.credits_used}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{job.duration_ms ? `${(job.duration_ms / 1000).toFixed(1)}s` : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground" title={formatDateTime(job.created_at)}>{timeAgo(job.created_at)}</TableCell>
                    <TableCell><GenerationRowActions job={job} userEmail={profiles?.email} businessName={businesses?.name} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/generations", sp)} />
    </div>
  );
}
