"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Handshake, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateAffiliateStatusAction, updateCommissionStatusAction } from "@/lib/actions/admin-affiliates";
import type { AffiliateRow, AffiliateStatus } from "@/lib/data/admin-affiliates";
import { formatDateTime, formatVND } from "@/lib/utils";

export function AffiliateActions({ affiliate }: { affiliate: AffiliateRow }) {
  const router = useRouter();
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [commOpen, setCommOpen] = React.useState(false);
  const [status, setStatus] = React.useState<AffiliateStatus>(affiliate.status);
  const [notes, setNotes] = React.useState(affiliate.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  function openStatus() {
    setStatus(affiliate.status);
    setNotes(affiliate.notes ?? "");
    setStatusOpen(true);
  }

  async function saveStatus() {
    setSaving(true);
    const res = await updateAffiliateStatusAction({ affiliateId: affiliate.id, status, notes });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã cập nhật");
    setStatusOpen(false);
    router.refresh();
  }

  async function setCommission(id: string, next: "approved" | "paid" | "rejected") {
    setBusyId(id);
    const res = await updateCommissionStatusAction({ commissionId: id, status: next });
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã cập nhật");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" onClick={() => setCommOpen(true)}><ListChecks /> Hoa hồng ({affiliate.commissions.length})</Button>
      <Button variant="ghost" size="sm" onClick={openStatus}><Handshake /> Trạng thái</Button>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trạng thái affiliate · {affiliate.code}</DialogTitle>
            <DialogDescription>{affiliate.user?.email ?? "—"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={`aff-status-${affiliate.id}`} className="text-sm font-medium">Trạng thái</label>
              <Select id={`aff-status-${affiliate.id}`} value={status} onChange={(e) => setStatus(e.target.value as AffiliateStatus)}>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="paid">Đã thanh toán</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor={`aff-notes-${affiliate.id}`} className="text-sm font-medium">Ghi chú nội bộ</label>
              <Textarea id={`aff-notes-${affiliate.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Ví dụ: Đã chuyển khoản ngày 05/10, STK ..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Huỷ</Button>
            <Button onClick={saveStatus} loading={saving}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commOpen} onOpenChange={setCommOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hoa hồng · {affiliate.code}</DialogTitle>
            <DialogDescription>
              Tổng {formatVND(affiliate.commissionTotal)} · đã trả {formatVND(affiliate.commissionPaid)} · còn lại {formatVND(affiliate.commissionPending)}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="info">
            <AlertDescription>Thanh toán hoa hồng được thực hiện thủ công (chuyển khoản). Sau khi chuyển, bấm &quot;Đã trả&quot; để ghi nhận và thông báo cho affiliate.</AlertDescription>
          </Alert>
          {affiliate.commissions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Chưa có hoa hồng nào.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Đơn hàng</TableHead><TableHead className="text-right">Giá trị đơn</TableHead><TableHead className="text-right">Hoa hồng</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {affiliate.commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.order ? <Link href={`/admin/orders/${c.order.id}`} className="font-mono text-xs font-semibold hover:underline">{c.order.order_number}</Link> : "—"}
                      <div className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}{c.order ? <> · <StatusBadge kind="order" value={c.order.status} className="px-1.5 text-[10px]" /></> : null}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.order ? formatVND(c.order.total) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="font-medium">{formatVND(c.amount)}</div>
                      <div className="text-xs text-muted-foreground">{c.rate}%</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind="commission" value={c.status} />
                      {c.paid_at ? <div className="text-xs text-muted-foreground">{formatDateTime(c.paid_at)}</div> : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === "paid" ? (
                        <span className="text-xs text-muted-foreground">Đã trả</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          {c.status === "pending" ? <Button size="sm" variant="ghost" loading={busyId === c.id} onClick={() => setCommission(c.id, "approved")}>Duyệt</Button> : null}
                          {c.status !== "rejected" ? <Button size="sm" variant="success" loading={busyId === c.id} onClick={() => setCommission(c.id, "paid")}>Đã trả</Button> : null}
                          {c.status !== "rejected" ? <Button size="sm" variant="ghost" className="text-destructive" loading={busyId === c.id} onClick={() => setCommission(c.id, "rejected")}>Từ chối</Button> : null}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
