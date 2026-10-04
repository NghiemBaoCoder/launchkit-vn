"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "./auth-card";
import { PasswordInput } from "./password-input";
import { resetPasswordAction } from "@/lib/actions/auth";

const schema = z.object({ password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"), confirm: z.string() }).refine((v) => v.password === v.confirm, { message: "Mật khẩu nhập lại không khớp", path: ["confirm"] });

export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    const res = await resetPasswordAction(values);
    if (!res.ok) return setServerError(res.error);
    toast.success(res.message ?? "Đã cập nhật mật khẩu");
    router.replace(res.data.redirectTo);
    router.refresh();
  }

  if (!hasSession) {
    return (
      <AuthCard title="Liên kết đã hết hạn" description="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.">
        <Button asChild className="w-full"><Link href="/forgot-password">Yêu cầu liên kết mới</Link></Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Đặt mật khẩu mới" description="Chọn mật khẩu mới cho tài khoản của bạn.">
      {serverError ? <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Mật khẩu mới</FormLabel><FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="confirm" render={({ field }) => (
            <FormItem><FormLabel>Nhập lại mật khẩu</FormLabel><FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Cập nhật mật khẩu</Button>
        </form>
      </Form>
    </AuthCard>
  );
}
