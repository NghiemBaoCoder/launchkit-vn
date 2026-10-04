"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateProfileAction } from "@/lib/actions/settings";
import { applyFieldErrors } from "./form-utils";
import { profileSchema, type ProfileInput } from "./schemas";

interface ProfileFormProps {
  defaultValues: ProfileInput;
  email: string;
  supportEmail?: string;
}

export function ProfileForm({ defaultValues, email, supportEmail = "support@launchkit.vn" }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  async function onSubmit(values: ProfileInput) {
    const res = await updateProfileAction(values);
    if (!res.ok) {
      applyFieldErrors(form, res.fieldErrors);
      toast.error(res.error);
      return;
    }
    form.reset(res.data);
    toast.success(res.message ?? "Đã lưu hồ sơ");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Nguyễn Văn A" maxLength={80} {...field} />
              </FormControl>
              <FormDescription>Tên này hiển thị trong ứng dụng và trên tài liệu bạn xuất ra.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số điện thoại <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
              </FormLabel>
              <FormControl>
                <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="0912 345 678" maxLength={20} {...field} />
              </FormControl>
              <FormDescription>Dùng khi đội ngũ hỗ trợ cần liên hệ với bạn.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email đăng nhập</Label>
          <Input id="profile-email" type="email" value={email} readOnly disabled aria-readonly />
          <p className="text-xs text-muted-foreground">
            Đổi email: liên hệ hỗ trợ{" "}
            <a href={`mailto:${supportEmail}`} className="font-medium text-primary hover:underline">
              {supportEmail}
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {form.formState.isDirty ? (
            <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={form.formState.isSubmitting}>
              Hoàn tác
            </Button>
          ) : null}
          <Button type="submit" loading={form.formState.isSubmitting}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  );
}
