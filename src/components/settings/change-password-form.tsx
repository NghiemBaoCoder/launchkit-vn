"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { changePasswordAction } from "@/lib/actions/auth";
import { applyFieldErrors } from "./form-utils";
import { changePasswordSchema, type ChangePasswordInput } from "./schemas";

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema), defaultValues: { current: "", password: "", confirm: "" } });

  async function onSubmit(values: ChangePasswordInput) {
    const res = await changePasswordAction(values);
    if (!res.ok) {
      applyFieldErrors(form, res.fieldErrors);
      toast.error(res.error);
      return;
    }
    form.reset();
    toast.success(res.message ?? "Đã đổi mật khẩu");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu hiện tại</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormDescription>Tối thiểu 8 ký tự, nên kết hợp chữ, số và ký tự đặc biệt.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Form>
  );
}
