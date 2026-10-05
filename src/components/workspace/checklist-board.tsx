"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SortableList } from "./sortable-list";
import { addChecklistItemAction, deleteChecklistItemAction, reorderChecklistItemsAction, resetChecklistAction, toggleChecklistItemAction, updateChecklistItemAction } from "@/lib/actions/checklists";
import { cn } from "@/lib/utils";
import type { Checklist, ChecklistItem } from "@/types";

export function ChecklistBoard({ checklist, items }: { checklist: Checklist; items: ChecklistItem[] }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [deleting, setDeleting] = React.useState<ChecklistItem | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  async function add() {
    if (!adding.trim()) return;
    setBusy(true);
    const res = await addChecklistItemAction({ checklistId: checklist.id, title: adding.trim() });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setAdding("");
    router.refresh();
  }
  async function saveEdit(id: string) {
    const res = await updateChecklistItemAction({ itemId: id, title: editTitle.trim() });
    if (!res.ok) return toast.error(res.error);
    setEditingId(null);
    router.refresh();
  }

  return (
    <Card id={`checklist-${checklist.kind}`}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div><CardTitle>{checklist.title}</CardTitle>{checklist.description ? <CardDescription>{checklist.description}</CardDescription> : null}</div>
        <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)} disabled={done === 0}><RotateCcw /> Đặt lại</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3"><Progress value={pct} className="h-1.5" /><span className="shrink-0 text-xs text-muted-foreground">{done}/{items.length}</span></div>
        <SortableList
          items={items}
          onReorder={async (ids) => { const r = await reorderChecklistItemsAction({ checklistId: checklist.id, orderedIds: ids }); if (!r.ok) toast.error(r.error); }}
          renderItem={(it, handle) => (
            <div className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5", it.done && "bg-muted/40")}>
              {handle}
              <Checkbox checked={it.done} onCheckedChange={async (v) => { const r = await toggleChecklistItemAction({ itemId: it.id, done: v === true }); if (!r.ok) toast.error(r.error); else router.refresh(); }} />
              {editingId === it.id ? (
                <><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(it.id); if (e.key === "Escape") setEditingId(null); }} /><Button size="icon-sm" variant="ghost" onClick={() => saveEdit(it.id)} aria-label="Lưu"><Check /></Button><Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)} aria-label="Huỷ"><X /></Button></>
              ) : (
                <>
                  <div className="min-w-0 flex-1"><div className={cn("text-sm", it.done && "text-muted-foreground line-through")}>{it.title}</div>{it.description ? <div className="text-xs text-muted-foreground">{it.description}</div> : null}</div>
                  <Button size="icon-sm" variant="ghost" onClick={() => { setEditingId(it.id); setEditTitle(it.title); }} aria-label="Sửa"><Pencil /></Button>
                  <Button size="icon-sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleting(it)} aria-label="Xoá"><Trash2 /></Button>
                </>
              )}
            </div>
          )}
        />
        <div className="flex gap-2">
          <Input value={adding} placeholder="Thêm việc mới…" onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
          <Button onClick={add} loading={busy} disabled={!adding.trim()}><Plus /> Thêm</Button>
        </div>
      </CardContent>
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title="Xoá việc này?" confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deleteChecklistItemAction(deleting.id); if (r.ok) router.refresh(); else toast.error(r.error); }} />
      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Đặt lại checklist?" description="Tất cả mục sẽ được bỏ đánh dấu hoàn thành." confirmLabel="Đặt lại" onConfirm={async () => { const r = await resetChecklistAction(checklist.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </Card>
  );
}
