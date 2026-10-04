import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Gift, Mail } from "lucide-react";
import { AvatarUploader } from "@/components/settings/avatar-uploader";
import { ProfileForm } from "@/components/settings/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { requireProfile } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Hồ sơ" };

export default async function ProfileSettingsPage() {
  const [profile, settings] = await Promise.all([requireProfile("/settings/profile"), getSiteSettings()]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>Ảnh hiển thị ở góc trên bên phải và trong các tài liệu chia sẻ.</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUploader key={profile.avatar_url ?? "none"} userId={profile.id} avatarUrl={profile.avatar_url} fullName={profile.full_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Họ tên và số điện thoại liên hệ.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm key={profile.updated_at} defaultValues={{ full_name: profile.full_name ?? "", phone: profile.phone ?? "" }} email={profile.email} supportEmail={settings.support_email} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản</CardTitle>
            <CardDescription>Thông tin chung về tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Gift className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mã giới thiệu</div>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-semibold">{profile.referral_code}</code>
                  <CopyButton value={profile.referral_code} label="Sao chép" successMessage="Đã sao chép mã giới thiệu" size="icon-sm" variant="ghost" />
                </div>
                <p className="text-xs text-muted-foreground">Chia sẻ để nhận hoa hồng khi bạn bè mua gói.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarDays className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Thành viên từ</div>
                <div className="text-sm font-medium">{formatDate(profile.created_at, "dd/MM/yyyy")}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Mail className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</div>
                <div className="truncate text-sm font-medium" title={profile.email}>{profile.email}</div>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/settings/referrals">
                Xem chương trình giới thiệu <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
