"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Download, MoreHorizontal, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListInput } from "./list-input";
import { packageSchema, type PackageInput } from "@/lib/workspace/schemas";
import { createPackageAction, deletePackageAction, duplicatePackageAction, updatePackageAction } from "@/lib/actions/pricing";
import { toCsv, downloadText } from "@/lib/workspace/csv";
import { cn, formatVND } from "@/lib/utils";
import type { PricingPackage, Service } from "@/types";

const TIER_LABEL: Record<string, string> = { basic: "Cơ bản", standard: "Tiêu chuẩn", premium: "Cao cấp", custom: "Tuỳ chỉnh" };

export function PricingPackages({ businessId, packages, services, businessName }: { businessId: string; packages: PricingPackage[]; services: Service[]; businessName: string }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<PricingPackage | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<PricingPackage | null>(null);
  const allFeatures = Array.from(new Set(packages.flatMap((p) => (p.features as string[]) ?? [])));

  function exportCsv() {
    const rows: (string | number)[][] = [["Loại", "Tên", "Giá (VND)", "Đơn vị", "Khuyến nghị", "Mô tả", "Hạng mục"]];
    for (const p of packages) rows.push(["Gói", p.name, p.price, p.billing_unit ?? "", p.recommended ? "Có" : "", p.description ?? "", ((p.features as string[]) ?? []).join(" | ")]);
    for (const s of services) rows.push(["Dịch vụ", s.name, s.sale_price ?? s.price, s.unit ?? "", "", s.description ?? "", s.features.join(" | ")]);
    downloadText(`bang-gia-${businessName.toLowerCase().replace(/\s+/g, "-")}.csv`, toCsv(rows), "text/csv;charset=utf-8");
    toast.success("Đã tải bảng giá (CSV)");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Gói giá</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={packages.length === 0 && services.length === 0}><Download /> Xuất CSV</Button>
          <Button onClick={() => setEditing("new")}><Plus /> Gói tuỳ chỉnh</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className={cn("relative flex flex-col rounded-2xl border bg-card p-5 shadow-xs", p.recommended && "border-primary ring-2 ring-primary/20")}>
            {p.recommended ? <Badge className="absolute -top-2.5 left-4"><Star className="size-3" /> Khuyến nghị</Badge> : null}
            <div className="flex items-start justify-between gap-2">
              <div><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{TIER_LABEL[p.tier] ?? p.tier}</div><h3 className="text-lg font-bold">{p.name}</h3></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditing(p)}><Pencil /> Sửa</DropdownMenuItem>
                  <DropdownMenuItem onSelect={async () => { const r = await duplicatePackageAction(p.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}><Copy /> Nhân bản</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}><Trash2 /> Xoá</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3"><span className="text-2xl font-bold">{formatVND(p.price)}</span><span className="text-sm text-muted-foreground"> / {p.billing_unit}</span></div>
            {p.description ? <p className="mt-2 text-sm text-muted-foreground">{p.description}</p> : null}
            <ul className="mt-4 space-y-1.5 text-sm">
              {((p.features as string[]) ?? []).map((f, i) => (<li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>))}
            </ul>
            <Button variant={p.recommended ? "default" : "outline"} className="mt-5" onClick={() => setEditing(p)}><Pencil /> Chỉnh sửa gói</Button>
          </div>
        ))}
        {packages.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-3">Chưa có gói giá. Tạo gói tuỳ chỉnh hoặc chạy "Tạo lại bảng giá".</div> : null}
      </div>

      {packages.length > 1 ? (
        <div className="rounded-xl border bg-card">
          <div className="border-b px-4 py-3"><h3 className="font-semibold">So sánh gói</h3><p className="text-xs text-muted-foreground">Sửa hạng mục trong từng gói để cập nhật bảng so sánh.</p></div>
          <Table>
            <TableHeader><TableRow><TableHead>Hạng mục</TableHead>{packages.map((p) => <TableHead key={p.id} className="text-center">{p.name}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Giá</TableCell>{packages.map((p) => <TableCell key={p.id} className="text-center font-semibold">{formatVND(p.price)}</TableCell>)}</TableRow>
              {allFeatures.map((f) => (
                <TableRow key={f}><TableCell>{f}</TableCell>{packages.map((p) => <TableCell key={p.id} className="text-center">{((p.features as string[]) ?? []).includes(f) ? <Check className="mx-auto size-4 text-success" /> : <span className="text-muted-foreground">—</span>}</TableCell>)}</TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <PackageDialog businessId={businessId} pkg={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={`Xoá gói "${deleting?.name}"?`} description="Gói sẽ bị xoá khỏi bảng giá và website." confirmLabel="Xoá" destructive onConfirm={async () => { if (!deleting) return; const r = await deletePackageAction(deleting.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}

function PackageDialog({ businessId, pkg, onClose }: { businessId: string; pkg: PricingPackage | "new" | null; onClose: () => void }) {
  const router = useRouter();
  const isNew = pkg === "new";
  const defaults: PackageInput = React.useMemo(() => (isNew || !pkg ? { name: "", description: "", price: 0, billing_unit: "gói", features: [], recommended: false } : { name: pkg.name, description: pkg.description ?? "", price: pkg.price, billing_unit: pkg.billing_unit ?? "gói", features: (pkg.features as string[]) ?? [], recommended: pkg.recommended }), [pkg, isNew]);
  const form = useForm<PackageInput>({ resolver: zodResolver(packageSchema), defaultValues: defaults });
  React.useEffect(() => { form.reset(defaults); }, [defaults, form]);
  async function onSubmit(values: PackageInput) {
    const res = isNew ? await createPackageAction(businessId, values) : await updatePackageAction((pkg as PricingPackage).id, values);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    onClose();
    router.refresh();
  }
  return (
    <Dialog open={pkg !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{isNew ? "Thêm gói tuỳ chỉnh" : "Sửa gói giá"}</DialogTitle><DialogDescription>Gói giá hiển thị trên website và trong báo giá.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Tên gói *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="billing_unit" render={({ field }) => (<FormItem><FormLabel>Đơn vị tính</FormLabel><FormControl><Input placeholder="gói / tháng / buổi" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Giá (VND) *</FormLabel><FormControl><Input type="number" min={0} step={1000} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="recommended" render={({ field }) => (<FormItem className="flex items-center gap-3 pt-6"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Gói khuyến nghị</FormLabel></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Mô tả</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="features" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Hạng mục trong gói</FormLabel><FormControl><ListInput value={field.value} onChange={field.onChange} placeholder="Ví dụ: 3 vòng chỉnh sửa" /></FormControl><FormMessage /></FormItem>)} />
            <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Huỷ</Button><Button type="submit" loading={form.formState.isSubmitting}>{isNew ? "Thêm" : "Lưu"}</Button></div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
