"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendContactMessageAction } from "@/lib/actions/contact";

const TOPIC_OPTIONS = [
  { value: "support", label: "Hỗ trợ sử dụng" },
  { value: "billing", label: "Thanh toán & hoá đơn" },
  { value: "partnership", label: "Hợp tác / Affiliate" },
  { value: "feedback", label: "Góp ý sản phẩm" },
  { value: "other", label: "Khác" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(80, "Tên tối đa 80 ký tự"),
  email: z.email("Email không hợp lệ").max(120),
  topic: z.enum(["support", "billing", "partnership", "feedback", "other"], { message: "Chọn chủ đề" }),
  message: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự").max(2000, "Nội dung tối đa 2000 ký tự"),
});

type Values = z.infer<typeof schema>;

export function ContactForm({ defaultEmail = "", defaultName = "" }: { defaultEmail?: string; defaultName?: string }) {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, email: defaultEmail, topic: "support", message: "" },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const res = await sendContactMessageAction(values);
    if (!res.ok) {
      setServerError(res.error);
      if (res.fieldErrors) {
        for (const [field, msgs] of Object.entries(res.fieldErrors)) {
          if (msgs?.[0]) form.setError(field as keyof Values, { message: msgs[0] });
        }
      }
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã gửi");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-success/30 bg-success/5 px-6 py-12 text-center animate-slide-up">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CircleCheck className="size-7" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold">Đã nhận tin nhắn của bạn</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Cảm ơn bạn. Đội ngũ LaunchKit sẽ phản hồi qua email trong vòng 1 ngày làm việc (thứ Hai – thứ Sáu).
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            form.reset({ name: form.getValues("name"), email: form.getValues("email"), topic: "support", message: "" });
            setSent(false);
          }}
        >
          Gửi tin nhắn khác
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError ? (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="ban@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chủ đề</FormLabel>
              <FormControl>
                <Select {...field}>
                  {TOPIC_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="Mô tả vấn đề hoặc câu hỏi của bạn. Nếu liên quan đến đơn hàng, vui lòng ghi mã đơn." {...field} />
              </FormControl>
              <FormDescription>{field.value.length}/2000 ký tự</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Bằng việc gửi, bạn đồng ý để LaunchKit liên hệ lại qua email đã cung cấp.</p>
          <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
            <Send /> Gửi tin nhắn
          </Button>
        </div>
      </form>
    </Form>
  );
}
