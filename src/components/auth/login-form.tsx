"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "./auth-card";
import { GoogleButton } from "./google-button";
import { signInAction } from "@/lib/actions/auth";
import { PasswordInput } from "./password-input";

const schema = z.object({ email: z.string().email("Email không hợp lệ"), password: z.string().min(1, "Nhập mật khẩu") });

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(initialError ?? null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    const res = await signInAction({ ...values, next });
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    toast.success("Đăng nhập thành công");
    router.replace(res.data.redirectTo);
    router.refresh();
  }

  return (
    <AuthCard
      title="Đăng nhập"
      description="Chào mừng bạn quay lại LaunchKit."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      {serverError ? (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" autoComplete="email" placeholder="ban@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mật khẩu</FormLabel>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Quên mật khẩu?</Link>
              </div>
              <FormControl><PasswordInput autoComplete="current-password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Đăng nhập</Button>
        </form>
      </Form>
      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">hoặc</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      </div>
      <GoogleButton next={next} />
    </AuthCard>
  );
}
