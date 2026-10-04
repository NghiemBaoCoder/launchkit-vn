"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2, Copy, LayoutList, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { contentItemSchema, type ContentItemInput } from "@/lib/workspace/schemas";
import { createContentItemAction, deleteContentItemAction, duplicateContentItemAction, setContentStatusAction, updateContentItemAction } from "@/lib/actions/content";
import { cn, formatDate } from "@/lib/utils";
import type { ContentItem } from "@/types";

export const PLATFORM_LABEL: Record<string, string> = { facebook: "Facebook", tiktok: "TikTok", instagram: "Instagram", threads: "Threads" };
export const STATUS_LABEL: Record<string, string> = { idea: "Ý tưởng", draft: "Nháp", ready: "Sẵn sàng", published: "Đã đăng" };
const STATUS_VARIANT: Record<string, "secondary" | "info" | "warning" | "success"> = { idea: "secondary", draft: "info", ready: "warning", published: "success" };
const PLATFORM_COLOR: Record<string, string> = { facebook: "bg-blue-500", tiktok: "bg-black dark:bg-white", instagram: "bg-pink-500", threads: "bg-zinc-700" };

export function ContentManager({ businessId, items, readOnly, lockedCount }: { businessId: string; items: ContentItem[]; readOnly?: boolean; lockedCount?: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [editing, setEditing] = React.useState<ContentItem | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<ContentItem | null>(null);
  const [platform, setPlatform] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  React.useEffect(() => {
    const target = sp.get("item");
    if (target) {
      const it = items.find((i) => i.id === target);
      if (it) setEditing(it);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const filtered = items.filter((i) => (platform === "all" || i.platform === platform) && (status === "all" || i.status === status));
  const byDate = filtered.reduce<Record<string, ContentItem[]>>((acc, i) => ((acc[i.scheduled_date ?? "none"] ??= []).push(i), acc), {});
  const dates = Object.keys(byDate).sort();

  async function setStatusFor(item: ContentItem, s: ContentItem["status"]) {
    const res = await setContentStatusAction(item.id, s);
    if (res.ok) { toast.success(res.message); router.refresh(); } else toast.error(res.error);
  }

  const itemText = (i: ContentItem) => [i.hook, i.caption, i.cta].filter(Boolean).join("\n\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-40"><option value="all">Mọi nền tảng</option>{Object.entries(PLATFORM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40"><option value="all">Mọi trạng thái</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <span className="text-sm text-muted-foreground">{filtered.length} nội dung{lockedCount ? ` · ${lockedCount} đang khoá` : ""}</span>
        {!readOnly ? <Button className="ml-auto" onClick={() => setEditing("new")}><Plus /> Tạo nội dung</Button> : null}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Chưa có nội dung" description="Tạo nội dung đầu tiên hoặc chạy trình tạo để có 30 bài đa nền tảng." action={!readOnly ? <Button onClick={() => setEditing("new")}><Plus /> Tạo nội dung</Button> : undefined} />
      ) : (
        <Tabs defaultValue="calendar">
          <TabsList><TabsTrigger value="calendar"><CalendarDays /> Lịch</TabsTrigger><TabsTrigger value="library"><LayoutList /> Thư viện</TabsTrigger></TabsList>
          <TabsContent value="calendar">
            {dates.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Không có nội dung khớp bộ lọc.</p> : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dates.map((d) => (
                  <div key={d} className="rounded-xl border bg-card">
                    <div className="border-b px-3 py-2 text-sm font-semibold">{d === "none" ? "Chưa lên lịch" : formatDate(d, "EEEE, dd/MM")}</div>
                    <ul className="divide-y">
                      {byDate[d].map((i) => (
                        <li key={i.id}>
                          <button type="button" className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-accent/50" onClick={() => setEditing(i)}>
                            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", PLATFORM_COLOR[i.platform])} />
                            <span className="min-w-0"><span className="block truncate text-sm">{i.title}</span><span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{PLATFORM_LABEL[i.platform]} · {i.content_type}<Badge variant={STATUS_VARIANT[i.status]} className="px-1.5 py-0 text-[10px]">{STATUS_LABEL[i.status]}</Badge></span></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="library">
            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((i) => (
                <article key={i.id} className="flex flex-col rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("size-2 rounded-full", PLATFORM_COLOR[i.platform])} />{PLATFORM_LABEL[i.platform]} · {i.content_type}{i.scheduled_date ? ` · ${formatDate(i.scheduled_date)}` : ""}</div><h3 className="mt-1 font-semibold">{i.title}</h3></div>
                    <Badge variant={STATUS_VARIANT[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                  </div>
                  {i.hook ? <p className="mt-2 text-sm font-medium">{i.hook}</p> : null}
                  {i.caption ? <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{i.caption}</p> : null}
                  {i.cta ? <p className="mt-2 text-sm text-primary">👉 {i.cta}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3">
                    <CopyButton value={itemText(i)} variant="ghost" size="sm" />
                    {!readOnly ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(i)}><Pencil /> Sửa</Button>
                        {i.status !== "published" ? <Button variant="ghost" size="sm" onClick={() => setStatusFor(i, "published")}><CheckCircle2 /> Đã đăng</Button> : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(["idea", "draft", "ready", "published"] as const).filter((s) => s !== i.status).map((s) => <DropdownMenuItem key={s} onSelect={() => setStatusFor(i, s)}>Đánh dấu: {STATUS_LABEL[s]}</DropdownMenuItem>)}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={async () => { const r = await duplicateContentItemAction(i.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}><Copy /> Nhân bản</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(i)}><Trash2 /> Xoá</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <ContentDialog businessId={businessId} item={editing} onClose={() => { setEditing(null); if (sp.get("item")) router.replace(`/business/${businessId}/content`); }} readOnly={readOnly} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={`Xoá "${deleting?.title}"?`} description="Nội dung sẽ bị xoá vĩnh viễn." confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deleteContentItemAction(deleting.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}

function ContentDialog({ businessId, item, onClose, readOnly }: { businessId: string; item: ContentItem | "new" | null; onClose: () => void; readOnly?: boolean }) {
  const router = useRouter();
  const isNew = item === "new";
  const defaults: ContentItemInput = React.useMemo(() => (isNew || !item ? { title: "", hook: "", caption: "", cta: "", platform: "facebook", content_type: "post", status: "idea", scheduled_date: null } : { title: item.title, hook: item.hook ?? "", caption: item.caption ?? "", cta: item.cta ?? "", platform: item.platform, content_type: item.content_type, status: item.status, scheduled_date: item.scheduled_date }), [item, isNew]);
  const form = useForm<ContentItemInput>({ resolver: zodResolver(contentItemSchema), defaultValues: defaults });
  React.useEffect(() => { form.reset(defaults); }, [defaults, form]);
  async function onSubmit(values: ContentItemInput) {
    const res = isNew ? await createContentItemAction(businessId, values) : await updateContentItemAction((item as ContentItem).id, values);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    onClose();
    router.refresh();
  }
  const text = [form.watch("hook"), form.watch("caption"), form.watch("cta")].filter(Boolean).join("\n\n");
  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{isNew ? "Tạo nội dung" : readOnly ? "Xem nội dung" : "Sửa nội dung"}</DialogTitle><DialogDescription>Hook → Caption → CTA. Sao chép và đăng lên nền tảng bạn chọn.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <fieldset disabled={readOnly} className="contents">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Tiêu đề *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="platform" render={({ field }) => (<FormItem><FormLabel>Nền tảng</FormLabel><FormControl><Select {...field}>{Object.entries(PLATFORM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="content_type" render={({ field }) => (<FormItem><FormLabel>Loại nội dung</FormLabel><FormControl><Select {...field}>{["post", "video", "reel", "carousel", "story", "thread", "live"].map((t) => <option key={t} value={t}>{t}</option>)}</Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Trạng thái</FormLabel><FormControl><Select {...field}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="scheduled_date" render={({ field }) => (<FormItem><FormLabel>Ngày đăng dự kiến</FormLabel><FormControl><Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hook" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Hook (câu mở đầu)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="caption" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Caption</FormLabel><FormControl><Textarea rows={7} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cta" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>CTA (kêu gọi hành động)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </fieldset>
            <div className="flex flex-wrap justify-between gap-2 sm:col-span-2">
              <CopyButton value={text} label="Sao chép bài" />
              <div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose}>Đóng</Button>{!readOnly ? <Button type="submit" loading={form.formState.isSubmitting}>{isNew ? "Tạo" : "Lưu"}</Button> : null}</div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
