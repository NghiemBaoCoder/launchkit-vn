"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArchiveRestore, ImagePlus, Link2, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { businessSettingsSchema, type BusinessSettingsInput } from "@/lib/workspace/schemas";
import { archiveBusinessAction, deleteBusinessAction, regenerateShareTokenAction, toggleShareAction, updateBusinessLogoAction, updateBusinessSettingsAction, upsertShareAction } from "@/lib/actions/business";
import { initials } from "@/lib/utils";
import type { Business, BusinessType, Industry, Share } from "@/types";

const SHARE_SECTIONS = [["brand", "Thương hiệu"], ["services", "Dịch vụ"], ["pricing", "Bảng giá"], ["sales", "Bán hàng"], ["marketing", "Marketing"]] as const;

export function BusinessSettings({ business, businessTypes, industries, share, appUrl, userId }: { business: Business; businessTypes: BusinessType[]; industries: Industry[]; share: Share | null; appUrl: string; userId: string }) {
  const router = useRouter();
  const contact = (business.contact as Record<string, string>) ?? {};
  const form = useForm<BusinessSettingsInput>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: { name: business.name, industry_id: business.industry_id, business_type_id: business.business_type_id, currency: (business.currency as "VND" | "USD") ?? "VND", location: business.location ?? "", contact: { email: contact.email ?? "", phone: contact.phone ?? "", address: contact.address ?? "", website: contact.website ?? "", facebook: contact.facebook ?? "", zalo: contact.zalo ?? "", instagram: contact.instagram ?? "", tiktok: contact.tiktok ?? "" } },
  });
  const [uploading, setUploading] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [shareSections, setShareSections] = React.useState<string[]>(share?.sections ?? ["brand", "services", "pricing"]);
  const [shareDays, setShareDays] = React.useState(share?.expires_at ? 30 : 0);
  const [shareBusy, setShareBusy] = React.useState(false);
  const typeId = form.watch("business_type_id");
  const filteredIndustries = industries.filter((i) => !typeId || i.business_type_id === typeId);

  async function onSubmit(values: BusinessSettingsInput) {
    const res = await updateBusinessSettingsAction(business.id, values);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    router.refresh();
  }

  async function uploadLogo(file: File) {
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) return toast.error("Chỉ hỗ trợ PNG, JPG, WEBP, SVG");
    if (file.size > 2 * 1024 * 1024) return toast.error("Logo tối đa 2MB");
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${userId}/${business.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploading(false); return toast.error(`Tải lên thất bại: ${error.message}`); }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    const res = await updateBusinessLogoAction(business.id, data.publicUrl);
    setUploading(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    router.refresh();
  }

  const shareUrl = share ? `${appUrl}/share/${share.token}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Thông tin business</CardTitle><CardDescription>Tên, ngành, khu vực và thông tin liên hệ dùng trong website & tài liệu.</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-muted text-xl font-bold text-primary">{business.logo_url ? <img src={business.logo_url} alt="Logo" className="size-full object-cover" /> : initials(business.name)}</div>
            <div className="space-y-2">
              <Label htmlFor="logo" className="cursor-pointer"><span className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-accent">{uploading ? <RefreshCw className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} {business.logo_url ? "Đổi logo" : "Tải logo lên"}</span></Label>
              <input id="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }} />
              {business.logo_url ? <Button variant="ghost" size="sm" onClick={async () => { const r = await updateBusinessLogoAction(business.id, null); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}>Gỡ logo</Button> : null}
              <p className="text-xs text-muted-foreground">PNG/JPG/WEBP/SVG, tối đa 2MB.</p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Tên business *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="business_type_id" render={({ field }) => (<FormItem><FormLabel>Loại hình</FormLabel><FormControl><Select value={field.value ?? ""} onChange={(e) => { field.onChange(e.target.value || null); form.setValue("industry_id", null); }}><option value="">— Chọn —</option>{businessTypes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="industry_id" render={({ field }) => (<FormItem><FormLabel>Ngành</FormLabel><FormControl><Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)}><option value="">— Chọn —</option>{filteredIndustries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Tiền tệ</FormLabel><FormControl><Select {...field}><option value="VND">VND — Việt Nam Đồng</option><option value="USD">USD — Đô la Mỹ</option></Select></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Khu vực</FormLabel><FormControl><Input placeholder="TP.HCM" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="sm:col-span-2 pt-2 text-sm font-semibold">Thông tin liên hệ</div>
              {([["contact.phone", "Số điện thoại"], ["contact.email", "Email"], ["contact.zalo", "Zalo"], ["contact.website", "Website"], ["contact.facebook", "Facebook"], ["contact.instagram", "Instagram"], ["contact.tiktok", "TikTok"], ["contact.address", "Địa chỉ"]] as const).map(([name, label]) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (<FormItem className={name === "contact.address" ? "sm:col-span-2" : undefined}><FormLabel>{label}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              ))}
              <div className="flex justify-end sm:col-span-2"><Button type="submit" loading={form.formState.isSubmitting}><Save /> Lưu thay đổi</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card id="share">
        <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="size-4" /> Chia sẻ public</CardTitle><CardDescription>Tạo liên kết chỉ hiển thị những mục bạn chọn — phù hợp gửi đối tác, cộng sự.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-5">
            {SHARE_SECTIONS.map(([k, label]) => (<label key={k} className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"><Checkbox checked={shareSections.includes(k)} onCheckedChange={(v) => setShareSections((p) => (v === true ? [...p, k] : p.filter((x) => x !== k)))} />{label}</label>))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5"><Label>Hết hạn sau</Label><Select value={String(shareDays)} onChange={(e) => setShareDays(Number(e.target.value))} className="w-40"><option value="0">Không hết hạn</option><option value="7">7 ngày</option><option value="30">30 ngày</option><option value="90">90 ngày</option></Select></div>
            <Button loading={shareBusy} onClick={async () => { setShareBusy(true); const r = await upsertShareAction(business.id, { sections: shareSections, expiresInDays: shareDays }); setShareBusy(false); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}>{share ? "Cập nhật liên kết" : "Tạo liên kết chia sẻ"}</Button>
          </div>
          {share ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input readOnly value={shareUrl} className="min-w-0 flex-1 font-mono text-xs" />
                <CopyButton value={shareUrl} label="Sao chép" />
                <Button variant="ghost" size="sm" onClick={async () => { const r = await regenerateShareTokenAction(share.id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }}><RefreshCw /> Đổi liên kết</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <label className="flex items-center gap-2"><Switch checked={share.active} onCheckedChange={async (v) => { const r = await toggleShareAction(share.id, v); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} /> {share.active ? "Đang bật" : "Đã tắt"}</label>
                <span>· {share.view_count} lượt xem</span>
                {share.expires_at ? <Badge variant="secondary">Hết hạn {new Date(share.expires_at).toLocaleDateString("vi-VN")}</Badge> : null}
                <a href={shareUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Mở trang chia sẻ</a>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle>Vùng nguy hiểm</CardTitle><CardDescription>Lưu trữ để ẩn khỏi danh sách (có thể khôi phục). Xoá là vĩnh viễn.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setArchiveOpen(true)}>{business.status === "archived" ? <><ArchiveRestore /> Khôi phục business</> : <><Archive /> Lưu trữ business</>}</Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 /> Xoá business</Button>
        </CardContent>
      </Card>

      <ConfirmDialog open={archiveOpen} onOpenChange={setArchiveOpen} title={business.status === "archived" ? "Khôi phục business?" : "Lưu trữ business?"} description={business.status === "archived" ? "Business sẽ xuất hiện lại trong danh sách và có thể chỉnh sửa." : "Business sẽ bị ẩn khỏi dashboard và website public (nếu có) sẽ không truy cập được. Bạn có thể khôi phục sau."} confirmLabel={business.status === "archived" ? "Khôi phục" : "Lưu trữ"} onConfirm={async () => { const r = await archiveBusinessAction(business.id, business.status !== "archived"); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title={`Xoá vĩnh viễn "${business.name}"?`} description="Toàn bộ nội dung, tài liệu, website và file xuất sẽ bị xoá và KHÔNG thể khôi phục. Đơn hàng/mua kit vẫn được giữ trong lịch sử." confirmLabel="Xoá vĩnh viễn" destructive typeToConfirm={business.name} onConfirm={async () => { const r = await deleteBusinessAction(business.id); if (r.ok) { toast.success(r.message); router.push("/dashboard/businesses"); router.refresh(); } else toast.error(r.error); }} />
    </div>
  );
}
