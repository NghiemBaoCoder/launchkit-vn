"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Plus, Table2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePlanItemAction, togglePlanItemAction, upsertPlanItemAction } from "@/lib/actions/marketing";
import { cn, formatDate } from "@/lib/utils";
import type { MarketingPlanItem } from "@/types";

const KIND_LABEL: Record<string, string> = { task: "Việc", campaign: "Chiến dịch", promotion: "Khuyến mãi", content: "Nội dung" };
const KIND_VARIANT: Record<string, "secondary" | "info" | "warning" | "success"> = { task: "secondary", campaign: "info", promotion: "warning", content: "success" };

export function MarketingPlan({ businessId, items, readOnly, limitNote }: { businessId: string; items: MarketingPlanItem[]; readOnly?: boolean; limitNote?: string }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<MarketingPlanItem | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<MarketingPlanItem | null>(null);
  const done = items.filter((i) => i.done).length;
  const weeks = Array.from({ length: Math.ceil(Math.max(...items.map((i) => i.day_index), 28) / 7) }, (_, w) => items.filter((i) => i.day_index > w * 7 && i.day_index <= (w + 1) * 7).sort((a, b) => a.day_index - b.day_index));

  async function toggle(item: MarketingPlanItem, v: boolean) {
    const res = await togglePlanItemAction(item.id, v);
    if (!res.ok) toast.error(res.error);
    else router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{done}/{items.length} việc đã xong{limitNote ? ` · ${limitNote}` : ""}</p>
        {!readOnly ? <Button size="sm" onClick={() => setEditing("new")}><Plus /> Thêm việc</Button> : null}
      </div>
      <Tabs defaultValue="calendar">
        <TabsList><TabsTrigger value="calendar"><CalendarDays /> Lịch</TabsTrigger><TabsTrigger value="table"><Table2 /> Bảng</TabsTrigger></TabsList>
        <TabsContent value="calendar">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {weeks.map((week, w) => (
              <div key={w} className="rounded-xl border bg-card">
                <div className="border-b px-3 py-2 text-sm font-semibold">Tuần {w + 1}</div>
                <ul className="divide-y">
                  {week.length === 0 ? <li className="px-3 py-3 text-xs text-muted-foreground">Chưa có việc</li> : null}
                  {week.map((it) => (
                    <li key={it.id} className={cn("flex items-start gap-2 px-3 py-2", it.done && "opacity-60")}>
                      <Checkbox className="mt-0.5" checked={it.done} disabled={readOnly} onCheckedChange={(v) => toggle(it, v === true)} />
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => !readOnly && setEditing(it)} disabled={readOnly}>
                        <span className={cn("block text-sm", it.done && "line-through")}>{it.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">Ngày {it.day_index}{it.scheduled_date ? ` · ${formatDate(it.scheduled_date, "dd/MM")}` : ""}{it.channel ? ` · ${it.channel}` : ""} <Badge variant={KIND_VARIANT[it.kind] ?? "secondary"} className="px-1.5 py-0 text-[10px]">{KIND_LABEL[it.kind] ?? it.kind}</Badge></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Ngày</TableHead><TableHead>Việc</TableHead><TableHead>Kênh</TableHead><TableHead>Loại</TableHead>{!readOnly ? <TableHead className="w-24"></TableHead> : null}</TableRow></TableHeader>
              <TableBody>
                {items.sort((a, b) => a.day_index - b.day_index).map((it) => (
                  <TableRow key={it.id} className={cn(it.done && "opacity-60")}>
                    <TableCell><Checkbox checked={it.done} disabled={readOnly} onCheckedChange={(v) => toggle(it, v === true)} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs">Ngày {it.day_index}{it.scheduled_date ? <div className="text-muted-foreground">{formatDate(it.scheduled_date)}</div> : null}</TableCell>
                    <TableCell><div className={cn("text-sm", it.done && "line-through")}>{it.title}</div>{it.description ? <div className="text-xs text-muted-foreground">{it.description}</div> : null}</TableCell>
                    <TableCell className="text-sm">{it.channel}</TableCell>
                    <TableCell><Badge variant={KIND_VARIANT[it.kind] ?? "secondary"}>{KIND_LABEL[it.kind] ?? it.kind}</Badge></TableCell>
                    {!readOnly ? <TableCell className="text-right"><Button variant="ghost" size="icon-sm" onClick={() => setEditing(it)} aria-label="Sửa"><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => setDeleting(it)} aria-label="Xoá"><Trash2 /></Button></TableCell> : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <PlanItemDialog businessId={businessId} item={editing} onClose={() => setEditing(null)} nextDay={Math.max(1, ...items.map((i) => i.day_index + 1))} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title="Xoá việc này?" confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deletePlanItemAction(deleting.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}

function PlanItemDialog({ businessId, item, onClose, nextDay }: { businessId: string; item: MarketingPlanItem | "new" | null; onClose: () => void; nextDay: number }) {
  const router = useRouter();
  const isNew = item === "new";
  const [form, setForm] = React.useState({ title: "", description: "", channel: "Facebook", kind: "task", scheduled_date: "", day_index: nextDay });
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (item && item !== "new") setForm({ title: item.title, description: item.description ?? "", channel: item.channel ?? "", kind: item.kind, scheduled_date: item.scheduled_date ?? "", day_index: item.day_index });
    else setForm({ title: "", description: "", channel: "Facebook", kind: "task", scheduled_date: "", day_index: Math.min(90, nextDay) });
  }, [item, nextDay]);
  async function save() {
    setSaving(true);
    const res = await upsertPlanItemAction(businessId, isNew ? null : (item as MarketingPlanItem).id, { ...form, scheduled_date: form.scheduled_date || null, day_index: Number(form.day_index), kind: form.kind });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    onClose();
    router.refresh();
  }
  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isNew ? "Thêm việc vào kế hoạch" : "Sửa việc"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Tiêu đề *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Mô tả</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Ngày thứ</Label><Input type="number" min={1} max={90} value={form.day_index} onChange={(e) => setForm((f) => ({ ...f, day_index: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5"><Label>Ngày cụ thể</Label><Input type="date" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Kênh</Label><Input value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Loại</Label><Select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}>{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Huỷ</Button><Button onClick={save} loading={saving} disabled={!form.title.trim()}>{isNew ? "Thêm" : "Lưu"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
