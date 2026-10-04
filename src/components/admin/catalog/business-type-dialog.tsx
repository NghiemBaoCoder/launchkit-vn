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
  deleteBusinessTypeAction,
  upsertBusinessTypeAction,
} from "@/lib/actions/admin-catalog";
import { slugify } from "@/lib/utils";
import type { BusinessType } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Tên loại hình tối thiểu 2 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang")
    .max(60),
  description: z.string().trim().max(500),
  icon: z.string().trim().max(60),
  tagline: z.string().trim().max(160),
  hero_title: z.string().trim().max(160),
  hero_description: z.string().trim().max(600),
  highlights: z.string().max(2000),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(320),
  active: z.boolean(),
  sort_order: z.string().regex(/^\d*$/, "Nhập số nguyên không âm"),
});
type Values = z.infer<typeof schema>;

function toValues(bt?: BusinessType | null): Values {
  const seo = (bt?.seo ?? {}) as Record<string, unknown>;
  const highlights = Array.isArray(bt?.highlights)
    ? (bt!.highlights as unknown[]).map(String)
    : [];
  return {
    name: bt?.name ?? "",
    slug: bt?.slug ?? "",
    description: bt?.description ?? "",
    icon: bt?.icon ?? "",
    tagline: bt?.tagline ?? "",
    hero_title: bt?.hero_title ?? "",
    hero_description: bt?.hero_description ?? "",
    highlights: highlights.join("\n"),
    seo_title: typeof seo.title === "string" ? seo.title : "",
    seo_description: typeof seo.description === "string" ? seo.description : "",
    active: bt?.active ?? true,
    sort_order: String(bt?.sort_order ?? 0),
  };
}

export function BusinessTypeDialog({
  businessType,
  open,
  onOpenChange,
}: {
  businessType?: BusinessType | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const editing = Boolean(businessType);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Sửa loại hình" : "Thêm loại hình mới"}
          </DialogTitle>
          <DialogDescription>
            Loại hình kinh doanh (Freelancer, Salon…) có trang landing riêng và
            nhóm các ngành.
          </DialogDescription>
        </DialogHeader>
        {/* Form được mount lại mỗi lần mở dialog → state luôn mới */}
        <BusinessTypeForm
          businessType={businessType}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function BusinessTypeForm({
  businessType,
  onOpenChange,
}: {
  businessType?: BusinessType | null;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const editing = Boolean(businessType);
  const [slugTouched, setSlugTouched] = React.useState(editing);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(businessType),
  });
  const name = useWatch({ control: form.control, name: "name" });
  React.useEffect(() => {
    if (!slugTouched)
      form.setValue("slug", slugify(name), { shouldValidate: false });
  }, [name, slugTouched, form]);

  async function onSubmit(values: Values) {
    const res = await upsertBusinessTypeAction({
      id: businessType?.id,
      ...values,
      sort_order: Number(values.sort_order || 0),
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
              <FormLabel>Tên loại hình</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ví dụ: Freelancer" autoFocus />
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
                  className="font-mono"
                  placeholder="freelancer"
                />
              </FormControl>
              <FormDescription>Dùng cho URL /for/[slug].</FormDescription>
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
                <Input {...field} placeholder="Laptop" className="font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Biến kỹ năng thành dịch vụ có giá"
                />
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
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hero_title"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Hero title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Business Kit cho Freelancer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hero_description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Hero description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="highlights"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Điểm nổi bật</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={
                    "Mỗi dòng một điểm nổi bật\nBảng giá 3 gói\nKịch bản tư vấn"
                  }
                />
              </FormControl>
              <FormDescription>
                Mỗi dòng một mục, hiển thị dạng danh sách trên landing.
              </FormDescription>
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
              description="Tắt để ẩn khỏi site và wizard."
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
            {editing ? "Lưu thay đổi" : "Tạo loại hình"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function CreateBusinessTypeButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Thêm loại hình
      </Button>
      <BusinessTypeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function BusinessTypeRowActions({
  businessType,
  businessCount,
  industryCount,
}: {
  businessType: BusinessType;
  businessCount: number;
  industryCount: number;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const canDelete = businessCount === 0 && industryCount === 0;
  const reason =
    businessCount > 0
      ? `Có ${businessCount} business đang dùng`
      : industryCount > 0
        ? `Có ${industryCount} ngành đang gắn`
        : "Xoá loại hình";
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
        title={reason}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 />
      </Button>
      <BusinessTypeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        businessType={businessType}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        destructive
        title={`Xoá loại hình "${businessType.name}"?`}
        description="Thao tác không thể hoàn tác. Trang landing /for/[slug] của loại hình này sẽ biến mất."
        confirmLabel="Xoá"
        onConfirm={async () => {
          const res = await deleteBusinessTypeAction(businessType.id);
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
