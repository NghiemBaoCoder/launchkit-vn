"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, CheckCheck, Eye, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteContactMessageAction, updateContactMessageAction } from "@/lib/actions/admin-messages";
import { CONTACT_STATUS_LABEL, CONTACT_TOPIC_LABEL, type ContactMessage, type ContactStatus } from "@/lib/contact";
import { formatDateTime } from "@/lib/utils";

export function MessageActions({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [note, setNote] = React.useState(message.admin_note ?? "");
  const [pending, setPending] = React.useState<ContactStatus | "note" | null>(null);

  async function setStatus(status: ContactStatus) {
    setPending(status);
    const res = await updateContactMessageAction({ id: message.id, status, adminNote: note });
    setPending(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Đã cập nhật");
    router.refresh();
    if (status === "archived") setOpen(false);
  }

  async function saveNote() {
    setPending("note");
    const res = await updateContactMessageAction({ id: message.id, status: message.status === "new" ? "read" : message.status, adminNote: note });
    setPending(null);
    if (!res.ok) return toast.error(res.error);
    toast.success("Đã lưu ghi chú");
    router.refresh();
  }

  const openAndMarkRead = async () => {
    setOpen(true);
    if (message.status === "new") {
      const res = await updateContactMessageAction({ id: message.id, status: "read" });
      if (res.ok) router.refresh();
    }
  };

  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${CONTACT_TOPIC_LABEL[message.topic] ?? message.topic} — LaunchKit VN`)}&body=${encodeURIComponent(`Chào ${message.name},\n\n\n\n---\nTin nhắn của bạn:\n${message.message}`)}`;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button variant="outline" size="sm" onClick={openAndMarkRead}><Eye /> Xem</Button>
        {message.status !== "replied" && message.status !== "archived" ? (
          <Button variant="ghost" size="icon-sm" aria-label="Đánh dấu đã trả lời" onClick={() => setStatus("replied")} loading={pending === "replied"}><CheckCheck /></Button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {message.name}
              <Badge variant="secondary">{CONTACT_TOPIC_LABEL[message.topic] ?? message.topic}</Badge>
              <Badge variant="outline">{CONTACT_STATUS_LABEL[message.status]}</Badge>
            </DialogTitle>
            <DialogDescription>
              <a href={`mailto:${message.email}`} className="text-primary hover:underline">{message.email}</a> · {formatDateTime(message.created_at)}
              {message.handled_at ? ` · xử lý ${formatDateTime(message.handled_at)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[40dvh] overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{message.message}</div>
          <div className="space-y-2">
            <Label htmlFor={`note-${message.id}`}>Ghi chú nội bộ</Label>
            <Textarea id={`note-${message.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Đã gọi lại, chờ khách phản hồi…" maxLength={2000} />
            <div className="flex justify-end"><Button size="sm" variant="outline" onClick={saveNote} loading={pending === "note"}>Lưu ghi chú</Button></div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 /> Xoá (spam)</Button>
              {message.status !== "archived" ? <Button variant="ghost" size="sm" onClick={() => setStatus("archived")} loading={pending === "archived"}><Archive /> Lưu trữ</Button> : <Button variant="ghost" size="sm" onClick={() => setStatus("read")} loading={pending === "read"}>Bỏ lưu trữ</Button>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><a href={replyHref}><Mail /> Trả lời qua email</a></Button>
              <Button size="sm" onClick={() => setStatus("replied")} loading={pending === "replied"} disabled={message.status === "replied"}><CheckCheck /> Đã trả lời</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá tin nhắn này?"
        description={`Tin của ${message.name} (${message.email}) sẽ bị xoá vĩnh viễn. Dùng Lưu trữ nếu chỉ muốn ẩn.`}
        confirmLabel="Xoá vĩnh viễn"
        destructive
        onConfirm={async () => {
          const res = await deleteContactMessageAction(message.id);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã xoá");
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
