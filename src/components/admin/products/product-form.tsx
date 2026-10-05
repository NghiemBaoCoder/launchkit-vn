"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { upsertProductAction } from "@/lib/actions/admin-products";
import {
  ENTITLEMENT_KEYS,
  ENTITLEMENT_LABELS,
  type EntitlementKey,
} from "@/lib/access/policy";
import { formatVND, slugify } from "@/lib/utils";
import type { Product } from "@/types";

const money = z.string().trim().regex(/^\d*$/, "Nhập số nguyên (VND)");

const schema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang")
    .max(60),
  description: z.string().trim().max(1000),
  kind: z.enum(["free", "one_time", "subscription"]),
  price: money,
  sale_price: money,
  billing_interval: z.enum(["", "month", "year"]),
  features: z.string().max(5000),
  entitlements: z.array(z.enum(ENTITLEMENT_KEYS)),
  entitlement_scope: z.enum(["business", "account"]),
  credits: z.string().trim().regex(/^\d*$/, "Nhập số nguyên"),
  active: z.boolean(),
  recommended: z.boolean(),
  sort_order: z.string().trim().regex(/^\d*$/, "Nhập số nguyên"),
});
type Values = z.infer<typeof schema>;

function toValues(p?: Product | null): Values {
  const features = Array.isArray(p?.features)
    ? (p!.features as unknown[]).map(String)
    : [];
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    kind: p?.kind ?? "one_time",
    price: String(p?.price ?? 0),
    sale_price: p?.sale_price == null ? "" : String(p.sale_price),
    billing_interval: (p?.billing_interval === "month" ||
    p?.billing_interval === "year"
      ? p.billing_interval
      : "") as Values["billing_interval"],
    features: features.join("\n"),
    entitlements: (p?.entitlements ?? []).filter((k): k is EntitlementKey =>
      (ENTITLEMENT_KEYS as readonly string[]).includes(k),
    ),
    entitlement_scope:
      p?.entitlement_scope === "account" ? "account" : "business",
    credits: String(p?.credits ?? 0),
    active: p?.active ?? true,
    recommended: p?.recommended ?? false,
    sort_order: String(p?.sort_order ?? 0),
  };
}

function toInput(values: Values, id?: string) {
  return {
    id,
    name: values.name,
    slug: values.slug,
    description: values.description,
    kind: values.kind,
    price: Number(values.price || 0),
    sale_price: values.sale_price === "" ? null : Number(values.sale_price),
    billing_interval: values.billing_interval,
    features: values.features,
    entitlements: values.entitlements,
    entitlement_scope: values.entitlement_scope,
    credits: Number(values.credits || 0),
    active: values.active,
    recommended: values.recommended,
    sort_order: Number(values.sort_order || 0),
  };
}

/** Form chỉnh sửa sản phẩm đầy đủ (trang /admin/products/[id]). */
export function ProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(product),
  });
  const kind = useWatch({ control: form.control, name: "kind" });
  const price = Number(useWatch({ control: form.control, name: "price" }) || 0);
  const salePrice = useWatch({ control: form.control, name: "sale_price" });

  async function onSubmit(values: Values) {
    const res = await upsertProductAction(toInput(values, product.id));
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors)
        for (const [k, msgs] of Object.entries(res.fieldErrors))
          form.setError(k as keyof Values, { message: msgs[0] });
      return;
    }
    toast.success(res.message ?? "Đã lưu");
    form.reset(toValues(res.data));
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Tên và mô tả hiển thị ở trang giá và checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} className="font-mono" />
                    </FormControl>
                    <FormDescription>
                      Mã định danh dùng trong code (ví dụ business-kit). Đổi cẩn
                      thận.
                    </FormDescription>
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Tính năng (mỗi dòng một mục)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder={
                          "Thương hiệu đầy đủ\nBảng giá 3 gói\nXuất PDF"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giá & thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="free">Miễn phí</option>
                        <option value="one_time">Mua một lần</option>
                        <option value="subscription">
                          Định kỳ (subscription)
                        </option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billing_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chu kỳ thanh toán</FormLabel>
                    <FormControl>
                      <Select {...field} disabled={kind !== "subscription"}>
                        <option value="">— Không áp dụng —</option>
                        <option value="month">Hàng tháng</option>
                        <option value="year">Hàng năm</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VND)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        disabled={kind === "free"}
                      />
                    </FormControl>
                    <FormDescription>{formatVND(price)}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá khuyến mãi (VND)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="Để trống nếu không có"
                        disabled={kind === "free"}
                      />
                    </FormControl>
                    <FormDescription>
                      {salePrice
                        ? formatVND(Number(salePrice))
                        : "Không khuyến mãi"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits tặng kèm</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
                    </FormControl>
                    <FormDescription>
                      Cộng vào tài khoản khi thanh toán thành công.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormSwitchRow
                    label="Đang bán"
                    description="Ẩn khỏi trang giá khi tắt."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="recommended"
                render={({ field }) => (
                  <FormSwitchRow
                    label="Đề xuất"
                    description="Gắn nhãn Phổ biến trên bảng giá."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quyền mở khoá</CardTitle>
              <CardDescription>Entitlement được cấp khi mua.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="entitlement_scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phạm vi</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="business">
                          Theo business (mở khoá 1 business)
                        </option>
                        <option value="account">
                          Theo tài khoản (mọi business)
                        </option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entitlements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entitlements ({field.value.length})</FormLabel>
                    <div className="space-y-2 rounded-lg border p-3">
                      {ENTITLEMENT_KEYS.map((key) => {
                        const checked = field.value.includes(key);
                        return (
                          <label
                            key={key}
                            className="flex cursor-pointer items-start gap-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                field.onChange(
                                  v
                                    ? [...field.value, key]
                                    : field.value.filter((k) => k !== key),
                                )
                              }
                              className="mt-0.5"
                            />
                            <span>
                              {ENTITLEMENT_LABELS[key]}
                              <code className="ml-1 text-[11px] text-muted-foreground">
                                {key}
                              </code>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            <Save /> Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  );
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang")
    .max(60),
  kind: z.enum(["free", "one_time", "subscription"]),
  price: money,
});
type CreateValues = z.infer<typeof createSchema>;

/** Dialog "Tạo sản phẩm": nhập thông tin tối thiểu rồi chuyển sang trang chỉnh sửa đầy đủ. */
export function CreateProductButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Tạo sản phẩm
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo sản phẩm</DialogTitle>
            <DialogDescription>
              Sản phẩm mới được tạo ở trạng thái ẩn. Bạn sẽ hoàn thiện tính năng
              và quyền ở bước tiếp theo.
            </DialogDescription>
          </DialogHeader>
          {/* Form mount lại mỗi lần mở dialog */}
          <CreateProductForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateProductForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = React.useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", slug: "", kind: "one_time", price: "0" },
  });
  const name = useWatch({ control: form.control, name: "name" });
  React.useEffect(() => {
    if (!slugTouched) form.setValue("slug", slugify(name));
  }, [name, slugTouched, form]);

  async function onSubmit(values: CreateValues) {
    const res = await upsertProductAction({
      name: values.name,
      slug: values.slug,
      kind: values.kind,
      price: Number(values.price || 0),
      entitlement_scope: "business",
      billing_interval: values.kind === "subscription" ? "month" : "",
      active: false,
    });
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors)
        for (const [k, msgs] of Object.entries(res.fieldErrors))
          form.setError(k as keyof CreateValues, { message: msgs[0] });
      return;
    }
    toast.success(
      "Đã tạo sản phẩm (đang ẩn). Hoàn thiện thông tin rồi bật bán.",
    );
    onClose();
    router.push(`/admin/products/${res.data.id}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input {...field} autoFocus placeholder="Business Kit Plus" />
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
                  className="font-mono"
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value="free">Miễn phí</option>
                    <option value="one_time">Mua một lần</option>
                    <option value="subscription">Định kỳ</option>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá (VND)</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Tạo & chỉnh sửa
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
