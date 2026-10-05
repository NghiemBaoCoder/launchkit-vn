"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, FileText, Lock, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StructuredEditor } from "./structured-editor";
import { createDocumentAction, deleteDocumentAction, duplicateDocumentAction, updateDocumentAction } from "@/lib/actions/documents";
import { createExportAction } from "@/lib/actions/exports";
import { cn, formatDateTime } from "@/lib/utils";
import type { DocumentRow } from "@/types";
import { DOC_TYPES } from "@/lib/workspace/documents";

interface Props {
  businessId: string;
  documents: DocumentRow[];
  selected: DocumentRow | null;
  lockedTypes: string[];
  canExport: boolean;
  preview: React.ReactNode;
}

export function DocumentsManager({ businessId, documents, selected, lockedTypes, canExport, preview }: Props) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [exporting, setExporting] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<DocumentRow | null>(null);
  const [busyType, setBusyType] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEditing(false);
    if (selected) { setDraft(selected.content as Record<string, unknown>); setTitle(selected.title); }
  }, [selected]);

  const select = (id: string) => router.push(`/business/${businessId}/documents?doc=${id}`);

  async function create(type: string) {
    setBusyType(type);
    const res = await createDocumentAction(businessId, type);
    setBusyType(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    setCreating(false);
    router.push(`/business/${businessId}/documents?doc=${res.data.id}`);
    router.refresh();
  }
  async function save() {
    if (!selected) return;
    setSaving(true);
    const res = await updateDocumentAction(selected.id, { title, content: draft });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    setEditing(false);
    router.refresh();
  }
  async function exportDoc(doc: DocumentRow, format: "pdf" | "md" | "txt") {
    setExporting(`${doc.id}:${format}`);
    const res = await createExportAction({ businessId, kind: "document", format, items: [doc.id] });
    setExporting(null);
    if (!res.ok) return toast.error(res.error, { action: { label: "Nâng cấp", onClick: () => router.push(`/checkout/business-kit?business=${businessId}`) } });
    toast.success("Đã xuất — đang tải xuống");
    window.open(`/api/exports/${res.data.id}/download`, "_blank");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-3">
        <Button className="w-full" onClick={() => setCreating(true)}><Plus /> Tạo tài liệu</Button>
        <ul className="space-y-1.5">
          {documents.map((d) => {
            const meta = DOC_TYPES.find((t) => t.type === d.type);
            return (
              <li key={d.id}>
                <button type="button" onClick={() => select(d.id)} className={cn("flex w-full items-start gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-accent/50", selected?.id === d.id && "border-primary bg-primary/5")}>
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0"><span className="block truncate text-sm font-medium">{d.title}</span><span className="block text-[11px] text-muted-foreground">{meta?.label} · v{d.version} · {formatDateTime(d.updated_at)}</span></span>
                </button>
              </li>
            );
          })}
          {lockedTypes.map((t) => {
            const meta = DOC_TYPES.find((x) => x.type === t);
            return (<li key={t} className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground"><Lock className="size-4" /> {meta?.label}</li>);
          })}
        </ul>
      </aside>

      <section className="min-w-0 space-y-3">
        {!selected ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground"><FileText className="mb-2 size-8 opacity-50" />Chọn một tài liệu để xem trước, chỉnh sửa hoặc xuất PDF.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3">
              <div className="min-w-0">
                {editing ? <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 font-semibold" /> : <h2 className="truncate font-semibold">{selected.title}</h2>}
                <div className="text-xs text-muted-foreground">{DOC_TYPES.find((t) => t.type === selected.type)?.label} · phiên bản {selected.version}</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editing ? (
                  <><Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(selected.content as Record<string, unknown>); setTitle(selected.title); }}><X /> Huỷ</Button><Button size="sm" onClick={save} loading={saving}><Check /> Lưu</Button></>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil /> Sửa</Button>
                    <Button size="sm" variant="outline" onClick={() => exportDoc(selected, "pdf")} loading={exporting === `${selected.id}:pdf`} title={canExport ? "" : "Cần gói Business Kit"}><Download /> PDF</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="icon-sm" variant="outline" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => exportDoc(selected, "md")}><Download /> Xuất Markdown</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => exportDoc(selected, "txt")}><Download /> Xuất TXT</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={async () => { const r = await duplicateDocumentAction(selected.id); if (r.ok) { toast.success(r.message); router.push(`/business/${businessId}/documents?doc=${r.data.id}`); router.refresh(); } else toast.error(r.error); }}><Copy /> Nhân bản</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(selected)}><Trash2 /> Xoá</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
            {editing ? <div className="rounded-xl border bg-card p-4"><StructuredEditor value={draft as never} onChange={(v) => setDraft(v as Record<string, unknown>)} /></div> : preview}
          </>
        )}
      </section>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Tạo tài liệu mới</DialogTitle><DialogDescription>Tài liệu được điền sẵn từ thông tin business, bạn chỉ cần sửa tên khách và hạng mục.</DialogDescription></DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {DOC_TYPES.map((t) => {
              const locked = lockedTypes.includes(t.type);
              return (
                <button key={t.type} type="button" disabled={locked || busyType !== null} onClick={() => create(t.type)} className={cn("rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60")}>
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{t.label}</span>{locked ? <Badge variant="secondary"><Lock className="size-3" /> Premium</Badge> : busyType === t.type ? <span className="text-xs text-muted-foreground">Đang tạo…</span> : null}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={`Xoá "${deleting?.title}"?`} description="Tài liệu sẽ bị xoá vĩnh viễn. Các file đã xuất trước đó vẫn còn trong Tải xuống." confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deleteDocumentAction(deleting.id); if (r.ok) { toast.success(r.message); router.push(`/business/${businessId}/documents`); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}
