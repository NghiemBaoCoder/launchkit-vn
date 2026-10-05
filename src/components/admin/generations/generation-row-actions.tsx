"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { StageList } from "@/components/admin/stage-list";
import { JsonView } from "@/components/admin/json-view";
import { DetailList } from "@/components/admin/detail-list";
import { retryGenerationJobAction } from "@/lib/actions/admin-generations";
import { formatDateTime } from "@/lib/utils";
import type { GenerationJob } from "@/types";

interface Props {
  job: GenerationJob;
  userEmail?: string | null;
  businessName?: string | null;
}

export function GenerationRowActions({ job, userEmail, businessName }: Props) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [retryOpen, setRetryOpen] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);

  async function retry() {
    setRetrying(true);
    const res = await retryGenerationJobAction(job.id);
    setRetrying(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.data.status === "completed") toast.success(res.message ?? "Đã tạo lại thành công");
    else if (res.data.status === "failed") toast.error(res.message ?? "Job vẫn thất bại");
    else toast.info(res.message ?? "Job đang xử lý");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Chi tiết" onClick={() => setDetailOpen(true)}><Eye /></Button>
      {job.status === "failed" ? (
        <Button variant="outline" size="sm" onClick={() => setRetryOpen(true)} loading={retrying}><RotateCcw /> Thử lại</Button>
      ) : null}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">Generation job <StatusBadge kind="job" value={job.status} /></DialogTitle>
            <DialogDescription className="font-mono text-xs">{job.id}</DialogDescription>
          </DialogHeader>
          <DetailList
            items={[
              { label: "Business", value: <Link href={`/admin/businesses/${job.business_id}`} className="hover:underline">{businessName ?? job.business_id}</Link> },
              { label: "Người dùng", value: <Link href={`/admin/users/${job.user_id}`} className="hover:underline">{userEmail ?? job.user_id}</Link> },
              { label: "Loại", value: <Badge variant="outline">{job.type === "full" ? "Toàn bộ kit" : job.type}</Badge> },
              { label: "Provider / model", value: `${job.provider}${job.model ? ` · ${job.model}` : ""}` },
              { label: "Credits", value: job.credits_used },
              { label: "Số lần thử", value: job.attempts },
              { label: "Bắt đầu", value: job.started_at ? formatDateTime(job.started_at) : "—" },
              { label: "Hoàn tất", value: job.completed_at ? formatDateTime(job.completed_at) : "—" },
              { label: "Thời lượng", value: job.duration_ms ? `${(job.duration_ms / 1000).toFixed(1)}s` : "—" },
            ]}
          />
          {job.error ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{job.error}</p> : null}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Các stage</h4>
            <StageList stages={job.stages} />
          </div>
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">Xem JSON stages</summary>
            <div className="mt-2"><JsonView value={job.stages} maxHeight="max-h-72" /></div>
          </details>
          {job.status === "failed" ? (
            <div className="flex justify-end">
              <Button onClick={() => { setDetailOpen(false); setRetryOpen(true); }}><RotateCcw /> Thử lại job</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={retryOpen}
        onOpenChange={setRetryOpen}
        title="Thử lại job thất bại?"
        description="Các stage lỗi sẽ được chạy lại ngay (tối đa 15 lượt, có thể mất vài chục giây). Không trừ thêm credits của khách."
        confirmLabel="Chạy lại"
        onConfirm={retry}
      />
    </div>
  );
}
