import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { MessageActions } from "@/components/admin/messages/message-actions";
import { CONTACT_STATUS_LABEL, CONTACT_STATUSES, CONTACT_TOPIC_LABEL, listContactMessages, parseMessageFilters, type ContactStatus } from "@/lib/data/admin-messages";
import { baseHrefOf, type SearchParams } from "@/lib/data/admin-shared";
import { formatDateTime, formatNumber, truncate } from "@/lib/utils";

export const metadata = { title: "Hộp thư liên hệ" };

const STATUS_VARIANT: Record<ContactStatus, "info" | "secondary" | "success" | "outline"> = { new: "info", read: "secondary", replied: "success", archived: "outline" };

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters = parseMessageFilters(sp);
  const result = await listContactMessages(filters);
  const hasFilter = Boolean(filters.q || filters.status || filters.topic);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hộp thư liên hệ"
        description={`${formatNumber(result.total)} tin${hasFilter ? " khớp bộ lọc" : ""} · ${result.counts.new} mới · ${result.counts.replied} đã trả lời. Tin gửi từ trang /contact của website.`}
      />
      {result.error ? (
        <Alert variant="destructive">
          <AlertTitle>Không đọc được hộp thư</AlertTitle>
          <AlertDescription>
            {result.error}. Nếu bạn vừa nâng cấp, hãy chạy <code className="rounded bg-muted px-1 py-0.5 text-xs">supabase/dist/upgrade-20261004000007-contact-messages.sql</code> trong SQL Editor của Supabase.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {CONTACT_STATUSES.map((st) => (
          <Badge key={st} variant={STATUS_VARIANT[st]} className="gap-1">
            {CONTACT_STATUS_LABEL[st]} <span className="tabular-nums">{result.counts[st]}</span>
          </Badge>
        ))}
      </div>
      <DataTableToolbar
        searchPlaceholder="Tìm theo tên, email hoặc nội dung…"
        filters={[
          { name: "status", label: "Trạng thái", options: CONTACT_STATUSES.map((s) => ({ value: s, label: CONTACT_STATUS_LABEL[s] })) },
          { name: "topic", label: "Chủ đề", options: Object.entries(CONTACT_TOPIC_LABEL).map(([value, label]) => ({ value, label })) },
        ]}
      />
      {result.items.length === 0 ? (
        <EmptyState icon={Inbox} title={hasFilter ? "Không có tin khớp bộ lọc" : "Hộp thư trống"} description={hasFilter ? "Thử bỏ bộ lọc hoặc đổi từ khoá." : "Khi khách gửi form ở trang Liên hệ, tin sẽ xuất hiện ở đây."} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người gửi</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead className="min-w-[260px]">Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Xử lý</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((msg) => (
                <TableRow key={msg.id} className={msg.status === "new" ? "bg-primary/[0.03]" : undefined}>
                  <TableCell>
                    <div className="font-medium">{msg.name}</div>
                    <a href={`mailto:${msg.email}`} className="text-xs text-primary hover:underline">{msg.email}</a>
                    {msg.user_id ? <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Tài khoản</div> : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{CONTACT_TOPIC_LABEL[msg.topic] ?? msg.topic}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{truncate(msg.message, 140)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[msg.status]}>{CONTACT_STATUS_LABEL[msg.status]}</Badge>
                    {msg.handler ? <div className="mt-1 text-[11px] text-muted-foreground">bởi {msg.handler.full_name ?? msg.handler.email}</div> : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(msg.created_at)}</TableCell>
                  <TableCell className="text-right"><MessageActions message={msg} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} baseHref={baseHrefOf("/admin/messages", sp)} />
    </div>
  );
}
