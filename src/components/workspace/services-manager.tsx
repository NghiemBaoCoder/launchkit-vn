"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, MoreHorizontal, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { SortableList } from "./sortable-list";
import { ListInput } from "./list-input";
import { serviceSchema, type ServiceInput } from "@/lib/workspace/schemas";
import { createServiceAction, deleteServiceAction, duplicateServiceAction, reorderServicesAction, updateServiceAction } from "@/lib/actions/services";
import { formatVND, cn } from "@/lib/utils";
import type { Service } from "@/types";

export function ServicesManager({ businessId, services }: { businessId: string; services: Service[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Service | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<Service | null>(null);

  async function onReorder(ids: string[]) {
    const res = await reorderServicesAction(businessId, ids);
    if (!res.ok) toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}><Plus /> Thêm dịch vụ</Button>
      </div>
      {services.length === 0 ? (
        <EmptyState icon={Package} title="Chưa có dịch vụ nào" description="Thêm sản phẩm / dịch vụ đầu tiên hoặc chạy trình tạo để có gợi ý." action={<Button onClick={() => setEditing("new")}><Plus /> Thêm dịch vụ</Button>} />
      ) : (
        <SortableList
          items={services}
          onReorder={onReorder}
          renderItem={(s, handle) => (
            <div className={cn("flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs", !s.active && "opacity-60")}>
              <div className="pt-1">{handle}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{s.name}</h3>
                  {!s.active ? <Badge variant="secondary">Tạm ẩn</Badge> : null}
                  {s.sale_price ? <Badge variant="warning">Khuyến mãi</Badge> : null}
                </div>
                {s.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p> : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {s.delivery_time ? <span>⏱ {s.delivery_time}</span> : null}
                  {s.features.length ? <span>✓ {s.features.length} hạng mục</span> : null}
                  {s.target_customer ? <span>🎯 {s.target_customer}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="text-right">
                  {s.sale_price ? (<><div className="text-xs text-muted-foreground line-through">{formatVND(s.price)}</div><div className="font-bold text-primary">{formatVND(s.sale_price)}</div></>) : <div className="font-bold">{formatVND(s.price)}</div>}
                  <div className="text-xs text-muted-foreground">/ {s.unit}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditing(s)}><Pencil /> Sửa</DropdownMenuItem>
                    <DropdownMenuItem onSelect={async () => { const r = await duplicateServiceAction(s.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}><Copy /> Nhân bản</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(s)}><Trash2 /> Xoá</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        />
      )}

      <ServiceDialog businessId={businessId} service={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Xoá dịch vụ "${deleting?.name}"?`}
        description="Dịch vụ sẽ bị xoá khỏi bảng giá, website và tài liệu liên quan sẽ không tự cập nhật."
        confirmLabel="Xoá"
        destructive
        onConfirm={async () => {
          if (!deleting) return;
          const r = await deleteServiceAction(deleting.id);
          if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error);
        }}
      />
    </div>
  );
}

function ServiceDialog({ businessId, service, onClose }: { businessId: string; service: Service | "new" | null; onClose: () => void }) {
  const router = useRouter();
  const open = service !== null;
  const isNew = service === "new";
  const defaults: ServiceInput = React.useMemo(
    () => isNew || !service ? { name: "", description: "", price: 0, sale_price: null, unit: "gói", delivery_time: "", features: [], benefits: [], target_customer: "", upsell: "", active: true }
      : { name: service.name, description: service.description ?? "", price: service.price, sale_price: service.sale_price, unit: service.unit ?? "gói", delivery_time: service.delivery_time ?? "", features: service.features, benefits: service.benefits, target_customer: service.target_customer ?? "", upsell: service.upsell ?? "", active: service.active },
    [service, isNew],
  );
  const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: defaults });
  React.useEffect(() => { form.reset(defaults); }, [defaults, form]);

  async function onSubmit(values: ServiceInput) {
    const res = isNew ? await createServiceAction(businessId, values) : await updateServiceAction((service as Service).id, values);
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors) for (const [k, v] of Object.entries(res.fieldErrors)) form.setError(k as keyof ServiceInput, { message: v?.[0] });
      return;
    }
    toast.success(res.message);
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "Thêm dịch vụ" : "Sửa dịch vụ"}</DialogTitle>
          <DialogDescription>Thông tin này được dùng trong bảng giá, website và báo giá.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Tên dịch vụ *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Mô tả</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Giá (VND) *</FormLabel><FormControl><Input type="number" min={0} step={1000} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sale_price" render={({ field }) => (<FormItem><FormLabel>Giá khuyến mãi</FormLabel><FormControl><Input type="number" min={0} step={1000} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} /></FormControl><FormDescription>Để trống nếu không giảm.</FormDescription><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Đơn vị</FormLabel><FormControl><Input placeholder="gói / buổi / sản phẩm" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="delivery_time" render={({ field }) => (<FormItem><FormLabel>Thời gian thực hiện</FormLabel><FormControl><Input placeholder="7–14 ngày" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="features" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Hạng mục bao gồm</FormLabel><FormControl><ListInput value={field.value} onChange={field.onChange} placeholder="Ví dụ: 2 vòng chỉnh sửa" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="benefits" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Lợi ích cho khách</FormLabel><FormControl><ListInput value={field.value} onChange={field.onChange} placeholder="Ví dụ: Tiết kiệm 20 giờ tự làm" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="target_customer" render={({ field }) => (<FormItem><FormLabel>Khách hàng mục tiêu</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="upsell" render={({ field }) => (<FormItem><FormLabel>Gợi ý bán thêm (upsell)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="active" render={({ field }) => (<FormItem className="flex items-center gap-3 sm:col-span-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Đang bán (hiển thị trên website & bảng giá)</FormLabel></FormItem>)} />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>{isNew ? "Thêm" : "Lưu"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
