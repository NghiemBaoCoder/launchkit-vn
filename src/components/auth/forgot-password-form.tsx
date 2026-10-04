"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "./auth-card";
import { forgotPasswordAction } from "@/lib/actions/auth";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    const res = await forgotPasswordAction(values);
    if (!res.ok) return setServerError(res.error);
    setSent(true);
  }

  return (
    <AuthCard title="Quên mật khẩu" description="Nhập email, chúng tôi sẽ gửi liên kết đặt lại mật khẩu." footer={<Link href="/login" className="text-primary hover:underline">Quay lại đăng nhập</Link>}>
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success"><MailCheck className="size-6" /></div>
          <p className="text-sm text-muted-foreground">Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi. Kiểm tra cả thư mục Spam nhé.</p>
          <Button variant="outline" onClick={() => setSent(false)}>Gửi lại</Button>
        </div>
      ) : (
        <>
          {serverError ? <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert> : null}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" placeholder="ban@email.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Gửi liên kết đặt lại</Button>
            </form>
          </Form>
        </>
      )}
    </AuthCard>
  );
}
