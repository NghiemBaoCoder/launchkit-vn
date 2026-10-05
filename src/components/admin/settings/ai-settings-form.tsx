"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateAiSettingsAction } from "@/lib/actions/admin-settings";
import type { AiSettings } from "@/lib/data/settings";

const int = z.string().trim().regex(/^\d+$/, "Nhập số nguyên không âm");

const schema = z.object({
  provider: z.enum(["mock", "anthropic"]),
  model: z.string().trim().min(1, "Nhập tên model").max(120),
  credits_full: int,
  credits_section: int,
  credits_document: int,
  credits_content: int,
  max_businesses: int,
  max_regenerations_per_day: int,
  timeout_ms: int,
  stage_delay_ms: int,
});
type Values = z.infer<typeof schema>;

function toValues(s: AiSettings): Values {
  return {
    provider: s.provider,
    model: s.model,
    credits_full: String(s.credits.full),
    credits_section: String(s.credits.section),
    credits_document: String(s.credits.document),
    credits_content: String(s.credits.content),
    max_businesses: String(s.free_limits.max_businesses),
    max_regenerations_per_day: String(s.free_limits.max_regenerations_per_day),
    timeout_ms: String(s.timeout_ms),
    stage_delay_ms: String(s.stage_delay_ms),
  };
}

export function AiSettingsForm({ settings, hasAnthropicKey, envProvider }: { settings: AiSettings; hasAnthropicKey: boolean; envProvider: string }) {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(settings) });
  const provider = useWatch({ control: form.control, name: "provider" });

  async function onSubmit(v: Values) {
    const res = await updateAiSettingsAction({
      provider: v.provider,
      model: v.model,
      credits: { full: Number(v.credits_full), section: Number(v.credits_section), document: Number(v.credits_document), content: Number(v.credits_content) },
      free_limits: { max_businesses: Number(v.max_businesses), max_regenerations_per_day: Number(v.max_regenerations_per_day) },
      timeout_ms: Number(v.timeout_ms),
      stage_delay_ms: Number(v.stage_delay_ms),
    });
    if (!res.ok) {
      toast.error(res.error);
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
              <CardTitle>Provider</CardTitle>
              <CardDescription>Bộ sinh nội dung đang dùng cho mọi job generation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="provider" render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="mock">Mock (nội dung mẫu, không tốn phí)</option>
                      <option value="anthropic">Anthropic Claude</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl><Input {...field} className="font-mono" placeholder={provider === "anthropic" ? "claude-sonnet-5-5" : "launchkit-mock-v1"} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="timeout_ms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout mỗi stage (ms)</FormLabel>
                  <FormControl><Input {...field} inputMode="numeric" /></FormControl>
                  <FormDescription>Job thất bại nếu provider không trả lời trong khoảng này.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stage_delay_ms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ trễ mock mỗi stage (ms)</FormLabel>
                  <FormControl><Input {...field} inputMode="numeric" /></FormControl>
                  <FormDescription>Chỉ áp dụng cho provider mock để mô phỏng thời gian xử lý.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credits theo loại job</CardTitle>
              <CardDescription>Số credits trừ khi khách chạy từng loại generation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {([
                ["credits_full", "Toàn bộ kit"],
                ["credits_section", "Tạo lại 1 mục"],
                ["credits_document", "Tài liệu"],
                ["credits_content", "Nội dung"],
              ] as const).map(([name, label]) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
                )} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giới hạn gói miễn phí</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="max_businesses" render={({ field }) => (
                <FormItem><FormLabel>Số business tối đa</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="max_regenerations_per_day" render={({ field }) => (
                <FormItem><FormLabel>Số lần tạo lại / ngày</FormLabel><FormControl><Input {...field} inputMode="numeric" /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-4" /> API key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Alert variant="info">
                <AlertTitle>Chỉ cấu hình qua biến môi trường</AlertTitle>
                <AlertDescription>
                  <p>API key chỉ cấu hình qua biến môi trường <code className="font-mono">ANTHROPIC_API_KEY</code> — không lưu trong DB.</p>
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">ANTHROPIC_API_KEY</span>
                {hasAnthropicKey ? <Badge variant="success">Đã cấu hình</Badge> : <Badge variant="warning">Chưa có</Badge>}
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">AI_PROVIDER (env)</span>
                <code className="font-mono text-xs">{envProvider}</code>
              </div>
              {provider === "anthropic" && !hasAnthropicKey ? (
                <Alert variant="warning">
                  <AlertDescription>Chưa có API key: hệ thống sẽ tự động dùng provider mock cho tới khi biến môi trường được thiết lập.</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} disabled={!form.formState.isDirty}><Save /> Lưu cài đặt AI</Button>
        </div>
      </form>
    </Form>
  );
}
