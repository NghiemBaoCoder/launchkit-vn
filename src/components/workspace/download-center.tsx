"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, FileArchive, FileSpreadsheet, FileText, Lock, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { createExportAction, deleteExportAction, regenerateExportAction } from "@/lib/actions/exports";
import { cn, formatDateTime } from "@/lib/utils";
import type { ExportRow } from "@/types";
import Link from "next/link";

const SECTIONS: { key: string; label: string }[] = [
  { key: "brand", label: "Thương hiệu" }, { key: "services", label: "Dịch vụ" }, { key: "pricing", label: "Bảng giá" }, { key: "sales", label: "Bán hàng" }, { key: "marketing", label: "Marketing" }, { key: "content", label: "Nội dung" }, { key: "finance", label: "Tài chính" }, { key: "operations", label: "Vận hành" }, { key: "documents", label: "Tài liệu" },
];
const STATUS: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = { ready: { label: "Sẵn sàng", variant: "success" }, processing: { label: "Đang xử lý", variant: "warning" }, pending: { label: "Chờ", variant: "secondary" }, failed: { label: "Thất bại", variant: "destructive" } };
const FORMAT_ICON: Record<string, React.ComponentType<{ className?: string }>> = { pdf: FileText, md: FileText, txt: FileText, csv: FileSpreadsheet, zip: FileArchive };

function size(n: number | null) {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function DownloadCenter({ businessId, exports, canBasic, canPremium }: { businessId: string; exports: ExportRow[]; canBasic: boolean; canPremium: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string[]>(["brand", "pricing", "sales"]);
  const [deleting, setDeleting] = React.useState<ExportRow | null>(null);

  async function run(input: { kind: "full_kit" | "section"; format: "pdf" | "csv" | "txt" | "md" | "zip"; items?: string[] }, key: string) {
    setBusy(key);
    const res = await createExportAction({ businessId, ...input });
    setBusy(null);
    if (!res.ok) return toast.error(res.error, { action: { label: "Nâng cấp", onClick: () => router.push(`/checkout/${canBasic ? "business-kit-pro" : "business-kit"}?business=${businessId}`) } });
    toast.success(res.message ?? "Đã xuất file");
    router.refresh();
    window.open(`/api/exports/${res.data.id}/download`, "_blank");
  }

  const lockedNote = (needPremium: boolean) => (!canBasic ? "Cần gói Business Kit" : needPremium && !canPremium ? "Cần gói Business Kit Pro" : "");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={cn(!canPremium && "border-dashed")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Trọn bộ Business Kit {!canPremium ? <Badge variant="secondary"><Lock className="size-3" /> Pro</Badge> : null}</CardTitle>
            <CardDescription>Toàn bộ 9 mục trong một file. ZIP gồm PDF + Markdown + TXT + CSV + từng tài liệu PDF.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => run({ kind: "full_kit", format: "zip" }, "zip")} loading={busy === "zip"} disabled={!canPremium} title={lockedNote(true)}><FileArchive /> ZIP trọn bộ</Button>
            <Button variant="outline" onClick={() => run({ kind: "full_kit", format: "pdf" }, "pdf")} loading={busy === "pdf"} disabled={!canPremium} title={lockedNote(true)}><FileText /> PDF toàn bộ</Button>
            <Button variant="outline" onClick={() => run({ kind: "full_kit", format: "md" }, "md")} loading={busy === "md"} disabled={!canBasic} title={lockedNote(false)}>Markdown</Button>
            <Button variant="outline" onClick={() => run({ kind: "full_kit", format: "txt" }, "txt")} loading={busy === "txt"} disabled={!canBasic} title={lockedNote(false)}>TXT</Button>
            <Button variant="outline" onClick={() => run({ kind: "full_kit", format: "csv" }, "csv")} loading={busy === "csv"} disabled={!canBasic} title={lockedNote(false)}><FileSpreadsheet /> CSV dữ liệu</Button>
            {!canBasic ? <p className="w-full text-xs text-muted-foreground">Xuất file thuộc gói Business Kit. <Link href={`/checkout/business-kit?business=${businessId}`} className="text-primary hover:underline">Mở khoá ngay →</Link></p> : !canPremium ? <p className="w-full text-xs text-muted-foreground">ZIP và PDF toàn bộ thuộc Business Kit Pro. <Link href={`/checkout/business-kit-pro?business=${businessId}`} className="text-primary hover:underline">Nâng cấp →</Link></p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Từng mục</CardTitle><CardDescription>Chọn mục cần xuất rồi chọn định dạng.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {SECTIONS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"><Checkbox checked={selected.includes(s.key)} onCheckedChange={(v) => setSelected((prev) => (v === true ? [...prev, s.key] : prev.filter((k) => k !== s.key)))} />{s.label}</label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pdf", "md", "txt"] as const).map((f) => (
                <Button key={f} variant={f === "pdf" ? "default" : "outline"} size="sm" disabled={!canBasic || selected.length === 0} loading={busy === `sec-${f}`} onClick={() => run({ kind: "section", format: f, items: selected }, `sec-${f}`)} title={lockedNote(false)}>{f.toUpperCase()}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Lịch sử xuất</CardTitle><CardDescription>File được lưu an toàn trong kho của bạn. Liên kết tải có hiệu lực 10 phút mỗi lần bấm.</CardDescription></CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <EmptyState compact icon={Download} title="Chưa có file nào" description="Xuất Business Kit hoặc từng mục để bắt đầu." />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>File</TableHead><TableHead>Định dạng</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thời gian</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
              <TableBody>
                {exports.map((e) => {
                  const Icon = FORMAT_ICON[e.format] ?? FileText;
                  const st = STATUS[e.status] ?? STATUS.pending;
                  return (
                    <TableRow key={e.id}>
                      <TableCell><div className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /><div><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.kind === "full_kit" ? "Trọn bộ" : e.kind === "document" ? "Tài liệu" : `Mục: ${((e.items as string[]) ?? []).map((k) => SECTIONS.find((s) => s.key === k)?.label ?? k).join(", ")}`}{e.file_size ? ` · ${size(e.file_size)}` : ""}</div></div></div></TableCell>
                      <TableCell className="uppercase">{e.format}</TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge>{e.error ? <div className="max-w-56 truncate text-xs text-destructive" title={e.error}>{e.error}</div> : null}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(e.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {e.status === "ready" ? <Button asChild size="sm" variant="outline"><a href={`/api/exports/${e.id}/download`} target="_blank" rel="noreferrer"><Download /> Tải</a></Button> : null}
                          <Button size="sm" variant="ghost" loading={busy === `re-${e.id}`} onClick={async () => { setBusy(`re-${e.id}`); const r = await regenerateExportAction(e.id); setBusy(null); if (r.ok) { toast.success("Đã tạo lại file"); router.refresh(); } else toast.error(r.error); }} title="Tạo lại file với dữ liệu mới nhất"><RefreshCw /></Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleting(e)} aria-label="Xoá"><Trash2 /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title="Xoá file đã xuất?" description="File sẽ bị xoá khỏi kho lưu trữ. Bạn có thể xuất lại bất cứ lúc nào." confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deleteExportAction(deleting.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}
