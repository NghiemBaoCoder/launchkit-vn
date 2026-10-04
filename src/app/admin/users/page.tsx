import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, statusOptions } from "@/components/admin/status-badge";
import { UserLink } from "@/components/admin/user-link";
import { listUsers, parseUserFilters } from "@/lib/data/admin-users";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/utils";

export const metadata = { title: "Người dùng" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseUserFilters(sp);
  const result = await listUsers(filters);
  const hasFilter = Boolean(filters.q || filters.role || filters.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Người dùng" description={`${formatNumber(result.total)} tài khoản${hasFilter ? " khớp bộ lọc" : ""}. Không thể xoá tài khoản — chỉ tạm khoá.`} />
      <DataTableToolbar
        searchPlaceholder="Tìm theo email, họ tên, SĐT, mã giới thiệu…"
        filters={[
          { name: "role", label: "Vai trò", options: statusOptions("role") },
          { name: "status", label: "Trạng thái", options: statusOptions("user") },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Users} title={hasFilter ? "Không có người dùng khớp bộ lọc" : "Chưa có người dùng"} description={hasFilter ? "Thử từ khoá khác hoặc xoá bộ lọc." : "Tài khoản mới sẽ xuất hiện tại đây."} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead>Đăng ký</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="max-w-[280px]"><UserLink id={u.id} email={u.email} name={u.full_name} /></TableCell>
                  <TableCell><StatusBadge kind="role" value={u.role} /></TableCell>
                  <TableCell><StatusBadge kind="user" value={u.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(u.credits)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground" title={formatDateTime(u.created_at)}>{formatDateTime(u.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{u.last_seen_at ? timeAgo(u.last_seen_at) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/users", sp)} />
    </div>
  );
}
