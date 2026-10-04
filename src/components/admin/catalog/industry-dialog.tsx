"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSwitchRow } from "@/components/admin/form-switch-row";
import {
  deleteIndustryAction,
  upsertIndustryAction,
} from "@/lib/actions/admin-catalog";
import { slugify } from "@/lib/utils";
import type { Industry } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Tên ngành tối thiểu 2 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang")
    .max(60),
  icon: z.string().trim().max(60),
  description: z.string().trim().max(500),
  business_type_id: z.string(),
  active: z.boolean(),
  sort_order: z.string().regex(/^\d*$/, "Nhập số nguyên không âm"),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(320),
});
type Values = z.infer<typeof schema>;

export interface BusinessTypeOption {
  id: string;
  name: string;
  active: boolean;
}

function toValues(i?: Industry | null): Values {
  const seo = (i?.seo ?? {}) as Record<string, unknown>;
  return {
    name: i?.name ?? "",
    slug: i?.slug ?? "",
    icon: i?.icon ?? "",
    description: i?.description ?? "",
    business_type_id: i?.business_type_id ?? "",
    active: i?.active ?? true,
    sort_order: String(i?.sort_order ?? 0),
    seo_title: typeof seo.title === "string" ? seo.title : "",
    seo_description: typeof seo.description === "string" ? seo.description : "",
  };
}

export function IndustryDialog({
  industry,
  businessTypes,
  open,
  onOpenChange,
}: {
  industry?: Industry | null;
  businessTypes: BusinessTypeOption[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const editing = Boolean(industry);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Sửa ngành" : "Thêm ngành mới"}</DialogTitle>
          <DialogDescription>
            Ngành xuất hiện trong wizard onboarding và trang landing theo loại
            hình.
          </DialogDescription>
        </DialogHeader>
        {/* Form được mount lại mỗi lần mở dialog (Radix unmount content khi đóng) → không cần reset thủ công */}
        <IndustryForm
          industry={industry}
          businessTypes={businessTypes}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function IndustryForm({
  industry,
  businessTypes,
  onOpenChange,
}: {
  industry?: Industry | null;
  businessTypes: BusinessTypeOption[];
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const editing = Boolean(industry);
  const [slugTouched, setSlugTouched] = React.useState(editing);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(industry),
  });
  const name = useWatch({ control: form.control, name: "name" });
  React.useEffect(() => {
    if (!slugTouched)
      form.setValue("slug", slugify(name), { shouldValidate: false });
  }, [name, slugTouched, form]);

  async function onSubmit(values: Values) {
    const res = await upsertIndustryAction({
      id: industry?.id,
      ...values,
      sort_order: Number(values.sort_order || 0),
      business_type_id: values.business_type_id || null,
    });
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors)
        for (const [k, msgs] of Object.entries(res.fieldErrors))
          form.setError(k as keyof Values, { message: msgs[0] });
      return;
    }
    toast.success(res.message ?? "Đã lưu");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên ngành</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ví dụ: Thiết kế đồ hoạ"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(e);
                  }}
                  placeholder="thiet-ke-do-hoa"
                  className="font-mono"
                />
              </FormControl>
              <FormDescription>Tự tạo từ tên; có thể sửa.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="business_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại hình</FormLabel>
              <FormControl>
                <Select {...field}>
                  <option value="">— Không gắn loại hình —</option>
                  {businessTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name}
                      {bt.active ? "" : " (đã tắt)"}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (tên lucide)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Palette" className="font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Mô tả ngắn hiển thị trong wizard"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thứ tự</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormSwitchRow
              label="Hiển thị"
              description="Tắt để ẩn khỏi wizard mà không xoá."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <DialogFooter className="sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {editing ? "Lưu thay đổi" : "Tạo ngành"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function CreateIndustryButton({
  businessTypes,
}: {
  businessTypes: BusinessTypeOption[];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Thêm ngành
      </Button>
      <IndustryDialog
        open={open}
        onOpenChange={setOpen}
        businessTypes={businessTypes}
      />
    </>
  );
}

export function IndustryRowActions({
  industry,
  businessTypes,
  businessCount,
}: {
  industry: Industry;
  businessTypes: BusinessTypeOption[];
  businessCount: number;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const canDelete = businessCount === 0;
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Sửa"
        onClick={() => setEditOpen(true)}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Xoá"
        className="text-destructive hover:text-destructive"
        disabled={!canDelete}
        title={
          canDelete
            ? "Xoá ngành"
            : `Có ${businessCount} business đang dùng — hãy tắt thay vì xoá`
        }
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 />
      </Button>
      <IndustryDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        industry={industry}
        businessTypes={businessTypes}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        destructive
        title={`Xoá ngành "${industry.name}"?`}
        description="Thao tác không thể hoàn tác. Template gắn với ngành này sẽ trở thành template chung."
        confirmLabel="Xoá"
        onConfirm={async () => {
          const res = await deleteIndustryAction(industry.id);
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
