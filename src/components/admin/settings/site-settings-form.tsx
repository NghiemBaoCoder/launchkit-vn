"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImageIcon, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSwitchRow } from "@/components/admin/form-switch-row";
import { updateSiteSettingsAction } from "@/lib/actions/admin-settings";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/data/settings";
import { formatVND } from "@/lib/utils";

const int = z.string().trim().regex(/^\d+$/, "Nhập số nguyên không âm");
const dec = z.string().trim().regex(/^\d+(\.\d+)?$/, "Nhập số không âm");

const schema = z.object({
  site_name: z.string().trim().min(2, "Tên site tối thiểu 2 ký tự").max(80),
  logo_url: z.string().trim().max(500),
  support_email: z.string().trim().email("Email không hợp lệ"),
  default_currency: z.string().trim().length(3, "Mã tiền tệ gồm 3 ký tự"),
  price_business_kit: int,
  price_business_kit_pro: int,
  price_pro_membership: int,
  maintenance_mode: z.boolean(),
  registration_enabled: z.boolean(),
  referral_percentage: dec.refine((v) => Number(v) <= 100, "Tối đa 100%"),
  free_credits: int,
  purchase_credits: int,
  affiliate_auto_approve: z.boolean(),
});
type Values = z.infer<typeof schema>;

function toValues(s: SiteSettings): Values {
  return {
    site_name: s.site_name,
    logo_url: s.logo_url ?? "",
    support_email: s.support_email,
    default_currency: s.default_currency,
    price_business_kit: String(s.default_pricing.business_kit ?? 0),
    price_business_kit_pro: String(s.default_pricing.business_kit_pro ?? 0),
    price_pro_membership: String(s.default_pricing.pro_membership ?? 0),
    maintenance_mode: s.maintenance_mode,
    registration_enabled: s.registration_enabled,
    referral_percentage: String(s.referral_percentage),
    free_credits: String(s.free_credits),
    purchase_credits: String(s.purchase_credits),
    affiliate_auto_approve: s.affiliate_auto_approve,
  };
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(settings) });
  const logoUrl = useWatch({ control: form.control, name: "logo_url" });

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ tệp ảnh (PNG, JPG, WEBP, SVG).");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Ảnh tối đa 2MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `site/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("assets").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      form.setValue("logo_url", data.publicUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Đã tải logo lên. Bấm Lưu để áp dụng.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được logo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(v: Values) {
    const res = await updateSiteSettingsAction({
      site_name: v.site_name,
      logo_url: v.logo_url,
      support_email: v.support_email,
      default_currency: v.default_currency.toUpperCase(),
      default_pricing: { business_kit: Number(v.price_business_kit), business_kit_pro: Number(v.price_business_kit_pro), pro_membership: Number(v.price_pro_membership) },
      maintenance_mode: v.maintenance_mode,
      registration_enabled: v.registration_enabled,
      referral_percentage: Number(v.referral_percentage),
      free_credits: Number(v.free_credits),
      purchase_credits: Number(v.purchase_credits),
      affiliate_auto_approve: v.affiliate_auto_approve,
    });
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors) for (const [k, msgs] of Object.entries(res.fieldErrors)) if (k in schema.shape) form.setError(k as keyof Values, { message: msgs[0] });
      return;
    }
    toast.success(res.message ?? "Đã lưu");
    form.reset(toValues(res.data));
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thương hiệu & liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="site_name" render={({ field }) => (
                <FormItem><FormLabel>Tên site</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="support_email" render={({ field }) => (
                <FormItem><FormLabel>Email hỗ trợ</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="logo_url" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Logo</FormLabel>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="size-full object-contain" />
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormControl><Input {...field} placeholder="https://… hoặc tải ảnh lên" /></FormControl>
                      <div className="flex items-center gap-2">
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadLogo(f); }} />
                        <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}><Upload /> Tải ảnh lên</Button>
                        {logoUrl ? <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("logo_url", "", { shouldDirty: true })}>Xoá</Button> : null}
                      </div>
                      <FormDescription>Lưu vào bucket công khai <code className="font-mono">assets/site/</code>. Tối đa 2MB.</FormDescription>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="default_currency" render={({ field }) => (
                <FormItem><FormLabel>Tiền tệ mặc định</FormLabel><FormControl><Input {...field} className="font-mono uppercase" maxLength={3} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giá mặc định</CardTitle>
              <CardDescription>Giá tham chiếu hiển thị ở landing. Giá bán thực tế lấy từ sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {([
                ["price_business_kit", "Business Kit"],
                ["price_business_kit_pro", "Business Kit Pro"],
                ["price_pro_membership", "Pro Membership / tháng"],
              ] as const).map(([name, label]) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl><Input {...field} inputMode="numeric" /></FormControl>
                    <FormDescription>{formatVND(Number(field.value || 0))}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credits & giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="free_credits" render={({ field }) => (
                <FormItem><FormLabel>Credits tặng khi đăng ký</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="purchase_credits" render={({ field }) => (
                <FormItem><FormLabel>Credits khi mua kit</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="referral_percentage" render={({ field }) => (
                <FormItem><FormLabel>Hoa hồng giới thiệu (%)</FormLabel><FormControl><Input {...field} inputMode="decimal" /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vận hành</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField control={form.control} name="maintenance_mode" render={({ field }) => (
                <FormSwitchRow label="Chế độ bảo trì" description="Hiển thị thông báo bảo trì cho khách." checked={field.value} onCheckedChange={field.onChange} />
              )} />
              <FormField control={form.control} name="registration_enabled" render={({ field }) => (
                <FormSwitchRow label="Cho phép đăng ký" description="Tắt để tạm ngưng tạo tài khoản mới." checked={field.value} onCheckedChange={field.onChange} />
              )} />
              <FormField control={form.control} name="affiliate_auto_approve" render={({ field }) => (
                <FormSwitchRow label="Tự duyệt affiliate" description="Tài khoản mới được duyệt affiliate ngay." checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} disabled={!form.formState.isDirty}><Save /> Lưu cài đặt site</Button>
        </div>
      </form>
    </Form>
  );
}
