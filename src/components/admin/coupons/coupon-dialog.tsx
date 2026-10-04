"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSwitchRow } from "@/components/admin/form-switch-row";
import { upsertCouponAction } from "@/lib/actions/admin-coupons";
import { formatVND } from "@/lib/utils";
import type { Coupon } from "@/types";

const num = z.string().trim().regex(/^\d*(\.\d+)?$/, "Nhập số không âm");
const int = z.string().trim().regex(/^\d*$/, "Nhập số nguyên");

const schema = z.object({
  code: z.string().trim().min(3, "Mã tối thiểu 3 ký tự").max(32).regex(/^[A-Za-z0-9_-]+$/, "Chỉ gồm chữ, số, - và _"),
  description: z.string().trim().max(300),
  type: z.enum(["fixed", "percentage"]),
  value: num.refine((v) => Number(v) > 0, "Giá trị phải lớn hơn 0"),
  max_discount: int,
  min_order: int,
  usage_limit: int,
  per_user_limit: int.refine((v) => v === "" || Number(v) >= 1, "Tối thiểu 1"),
  starts_at: z.string(),
  expires_at: z.string(),
  applicable_product_ids: z.array(z.string()),
  active: z.boolean(),
});
type Values = z.infer<typeof schema>;

export interface ProductOption {
  id: string;
  name: string;
  active: boolean;
}

function toLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd'T'HH:mm");
}

function toValues(c?: Coupon | null): Values {
  return {
    code: c?.code ?? "",
    description: c?.description ?? "",
    type: c?.type ?? "percentage",
    value: c ? String(c.value) : "",
    max_discount: c?.max_discount == null ? "" : String(c.max_discount),
    min_order: String(c?.min_order ?? 0),
    usage_limit: c?.usage_limit == null ? "" : String(c.usage_limit),
    per_user_limit: String(c?.per_user_limit ?? 1),
    starts_at: toLocal(c?.starts_at ?? null),
    expires_at: toLocal(c?.expires_at ?? null),
    applicable_product_ids: c?.applicable_product_ids ?? [],
    active: c?.active ?? true,
  };
}

export function CouponDialog({ coupon, products, open, onOpenChange }: { coupon?: Coupon | null; products: ProductOption[]; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const editing = Boolean(coupon);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(coupon) });
  const type = useWatch({ control: form.control, name: "type" });
  const value = Number(useWatch({ control: form.control, name: "value" }) || 0);

  React.useEffect(() => {
    if (open) form.reset(toValues(coupon));
  }, [open, coupon, form]);

  async function onSubmit(values: Values) {
    const res = await upsertCouponAction({
      id: coupon?.id,
      code: values.code.toUpperCase(),
      description: values.description,
      type: values.type,
      value: Number(values.value),
      max_discount: values.max_discount === "" ? null : Number(values.max_discount),
      min_order: Number(values.min_order || 0),
      usage_limit: values.usage_limit === "" ? null : Number(values.usage_limit),
      per_user_limit: Number(values.per_user_limit || 1),
      starts_at: values.starts_at,
      expires_at: values.expires_at,
      applicable_product_ids: values.applicable_product_ids,
      active: values.active,
    });
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
          <DialogTitle>{editing ? `Sửa mã ${coupon!.code}` : "Tạo mã giảm giá"}</DialogTitle>
          <DialogDescription>{editing ? `Đã dùng ${coupon!.used_count} lần.` : "Mã được tự động viết hoa. Để trống giới hạn nếu không áp dụng."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem><FormLabel>Mã</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} className="font-mono uppercase" placeholder="SUMMER50" autoFocus={!editing} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Kiểu giảm</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value="percentage">Theo phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VND)</option>
                  </Select>
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Mô tả (nội bộ)</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="value" render={({ field }) => (
              <FormItem>
                <FormLabel>{type === "percentage" ? "Phần trăm giảm" : "Số tiền giảm (VND)"}</FormLabel>
                <FormControl><Input {...field} inputMode="decimal" /></FormControl>
                <FormDescription>{type === "percentage" ? `${value || 0}%` : formatVND(value)}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="max_discount" render={({ field }) => (
              <FormItem>
                <FormLabel>Giảm tối đa (VND)</FormLabel>
                <FormControl><Input {...field} inputMode="numeric" disabled={type !== "percentage"} placeholder="Không giới hạn" /></FormControl>
                <FormDescription>Chỉ áp dụng cho kiểu %.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="min_order" render={({ field }) => (
              <FormItem><FormLabel>Đơn tối thiểu (VND)</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="usage_limit" render={({ field }) => (
              <FormItem><FormLabel>Tổng số lần dùng</FormLabel><FormControl><Input {...field} inputMode="numeric" placeholder="Không giới hạn" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="per_user_limit" render={({ field }) => (
              <FormItem><FormLabel>Số lần / người</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="hidden sm:block" />
            <FormField control={form.control} name="starts_at" render={({ field }) => (
              <FormItem><FormLabel>Bắt đầu</FormLabel><FormControl><Input {...field} type="datetime-local" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="expires_at" render={({ field }) => (
              <FormItem><FormLabel>Hết hạn</FormLabel><FormControl><Input {...field} type="datetime-local" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="applicable_product_ids" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Áp dụng cho sản phẩm</FormLabel>
                <FormDescription>Không chọn gì = áp dụng mọi sản phẩm.</FormDescription>
                <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                  {products.map((p) => {
                    const checked = field.value.includes(p.id);
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox checked={checked} onCheckedChange={(v) => field.onChange(v ? [...field.value, p.id] : field.value.filter((x) => x !== p.id))} />
                        <span>{p.name}{p.active ? "" : <span className="text-muted-foreground"> (đã ẩn)</span>}</span>
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="active" render={({ field }) => (
              <FormSwitchRow label="Kích hoạt" description="Mã bị vô hiệu hoá sẽ không áp dụng được." checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>{editing ? "Lưu thay đổi" : "Tạo mã"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCouponButton({ products }: { products: ProductOption[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus /> Tạo mã</Button>
      <CouponDialog open={open} onOpenChange={setOpen} products={products} />
    </>
  );
}

export function EditCouponButton({ coupon, products }: { coupon: Coupon; products: ProductOption[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Sửa" onClick={() => setOpen(true)}><Pencil /></Button>
      <CouponDialog open={open} onOpenChange={setOpen} coupon={coupon} products={products} />
    </>
  );
}
