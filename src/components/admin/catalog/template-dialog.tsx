"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSwitchRow } from "@/components/admin/form-switch-row";
import { deleteTemplateAction, upsertTemplateAction } from "@/lib/actions/admin-catalog";
import type { Template } from "@/types";

export const TEMPLATE_CATEGORY_LABELS: Record<Template["category"], string> = {
  brand: "Thương hiệu",
  pricing: "Bảng giá",
  sales: "Bán hàng",
  marketing: "Marketing",
  content: "Nội dung",
  website: "Website",
  operations: "Vận hành",
  documents: "Tài liệu",
};

const schema = z.object({
  name: z.string().trim().min(2, "Tên template tối thiểu 2 ký tự").max(120),
  category: z.enum(["brand", "pricing", "sales", "marketing", "content", "website", "operations", "documents"]),
  business_type_id: z.string(),
  industry_id: z.string(),
  config: z.string().max(50000, "Config quá lớn").refine((s) => {
    if (!s.trim()) return true;
    try {
      const v = JSON.parse(s);
      return v && typeof v === "object" && !Array.isArray(v);
    } catch {
      return false;
    }
  }, "Config phải là JSON object hợp lệ"),
  active: z.boolean(),
});
type Values = z.infer<typeof schema>;

export interface Option {
  id: string;
  name: string;
  active: boolean;
}

function toValues(t?: Template | null): Values {
  return {
    name: t?.name ?? "",
    category: t?.category ?? "brand",
    business_type_id: t?.business_type_id ?? "",
    industry_id: t?.industry_id ?? "",
    config: t ? JSON.stringify(t.config, null, 2) : "{\n  \n}",
    active: t?.active ?? true,
  };
}

export function TemplateDialog({ template, businessTypes, industries, open, onOpenChange }: { template?: Template | null; businessTypes: Option[]; industries: Option[]; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const editing = Boolean(template);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(template) });
  React.useEffect(() => {
    if (open) form.reset(toValues(template));
  }, [open, template, form]);

  function prettify() {
    try {
      const v = JSON.parse(form.getValues("config"));
      form.setValue("config", JSON.stringify(v, null, 2), { shouldValidate: true });
    } catch {
      toast.error("JSON chưa hợp lệ, không thể định dạng.");
    }
  }

  async function onSubmit(values: Values) {
    const res = await upsertTemplateAction({ id: template?.id, ...values, business_type_id: values.business_type_id || null, industry_id: values.industry_id || null });
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors) for (const [k, msgs] of Object.entries(res.fieldErrors)) form.setError(k as keyof Values, { message: msgs[0] });
      return;
    }
    toast.success(res.message ?? "Đã lưu");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Sửa template · v${template!.version}` : "Tạo template"}</DialogTitle>
          <DialogDescription>Config JSON được truyền vào AI provider khi sinh nội dung. Mỗi lần lưu sẽ tăng phiên bản.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Tên</FormLabel><FormControl><Input {...field} autoFocus placeholder="Thương hiệu — chuẩn" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select {...field}>
                    {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="business_type_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Loại hình (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value="">— Mọi loại hình —</option>
                    {businessTypes.map((o) => <option key={o.id} value={o.id}>{o.name}{o.active ? "" : " (đã tắt)"}</option>)}
                  </Select>
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="industry_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Ngành (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value="">— Mọi ngành —</option>
                    {industries.map((o) => <option key={o.id} value={o.id}>{o.name}{o.active ? "" : " (đã tắt)"}</option>)}
                  </Select>
                </FormControl>
                <FormDescription>Template theo ngành được ưu tiên hơn theo loại hình, rồi tới template chung.</FormDescription>
              </FormItem>
            )} />
            <FormField control={form.control} name="config" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Config (JSON)</FormLabel>
                  <Button type="button" variant="ghost" size="sm" onClick={prettify}><WandSparkles /> Định dạng</Button>
                </div>
                <FormControl><Textarea {...field} rows={12} className="font-mono text-xs" spellCheck={false} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="active" render={({ field }) => (
              <FormSwitchRow label="Kích hoạt" description="Chỉ template đang bật được dùng khi sinh nội dung." checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>{editing ? "Lưu (tăng phiên bản)" : "Tạo template"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateTemplateButton({ businessTypes, industries }: { businessTypes: Option[]; industries: Option[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus /> Tạo template</Button>
      <TemplateDialog open={open} onOpenChange={setOpen} businessTypes={businessTypes} industries={industries} />
    </>
  );
}

export function TemplateRowActions({ template, businessTypes, industries }: { template: Template; businessTypes: Option[]; industries: Option[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Sửa" onClick={() => setEditOpen(true)}><Pencil /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Xoá" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}><Trash2 /></Button>
      <TemplateDialog open={editOpen} onOpenChange={setEditOpen} template={template} businessTypes={businessTypes} industries={industries} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        destructive
        title={`Xoá template "${template.name}"?`}
        description="Nội dung đã sinh không bị ảnh hưởng, nhưng các lần sinh sau sẽ không dùng template này nữa. Cân nhắc tắt thay vì xoá."
        confirmLabel="Xoá"
        onConfirm={async () => {
          const res = await deleteTemplateAction(template.id);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã xoá");
          router.refresh();
        }}
      />
    </div>
  );
}
