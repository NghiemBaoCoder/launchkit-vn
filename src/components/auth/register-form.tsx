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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "./auth-card";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";
import { signUpAction } from "@/lib/actions/auth";

const schema = z.object({
  fullName: z.string().trim().min(2, "Nhập họ tên của bạn"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  terms: z.literal(true, { error: "Bạn cần đồng ý điều khoản" }),
});

export function RegisterForm({ next, registrationEnabled }: { next?: string; registrationEnabled: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { fullName: "", email: "", password: "", terms: undefined as unknown as true } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    const res = await signUpAction({ fullName: values.fullName, email: values.email, password: values.password, next });
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    toast.success(res.data.needsVerification ? "Kiểm tra email để xác thực tài khoản" : "Tạo tài khoản thành công");
    router.replace(res.data.redirectTo);
    router.refresh();
  }

  if (!registrationEnabled) {
    return (
      <AuthCard title="Tạm ngưng đăng ký" description="Hệ thống đang bảo trì phần đăng ký. Vui lòng quay lại sau." footer={<Link href="/login" className="text-primary hover:underline">Đã có tài khoản? Đăng nhập</Link>}>
        <Button asChild variant="outline" className="w-full"><Link href="/">Về trang chủ</Link></Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Tạo tài khoản miễn phí"
      description="Lưu Business Kit của bạn và tiếp tục chỉnh sửa bất cứ lúc nào."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary hover:underline">Đăng nhập</Link>
        </>
      }
    >
      {serverError ? (
        <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Họ tên</FormLabel><FormControl><Input autoComplete="name" placeholder="Nguyễn Văn A" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" placeholder="ban@email.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Mật khẩu</FormLabel><FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl><FormDescription>Ít nhất 8 ký tự.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="terms" render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4 accent-primary" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked ? true : undefined)} />
                <span>Tôi đồng ý với <Link href="/terms" className="text-primary hover:underline" target="_blank">Điều khoản</Link> và <Link href="/privacy" className="text-primary hover:underline" target="_blank">Chính sách bảo mật</Link>.</span>
              </label>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Tạo tài khoản</Button>
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
