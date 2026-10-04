import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Mail } from "lucide-react";
import { NotificationPrefsForm } from "@/components/settings/notification-prefs-form";
import { normalizePrefs } from "@/components/settings/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Thông báo" };

export default async function NotificationSettingsPage() {
  const profile = await requireProfile("/settings/notifications");
  const prefs = normalizePrefs(profile.notification_prefs);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" /> Thông báo qua email
          </CardTitle>
          <CardDescription>
            Gửi tới <span className="font-medium text-foreground">{profile.email}</span>. Thay đổi được lưu ngay khi bạn bật/tắt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPrefsForm key={JSON.stringify(prefs)} initial={prefs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" /> Thông báo trong ứng dụng
          </CardTitle>
          <CardDescription>Luôn bật, không gửi email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Các cập nhật quan trọng (tạo nội dung xong, thanh toán, hoa hồng giới thiệu, thông báo từ hệ thống) hiển thị ở biểu tượng chuông trên thanh công cụ.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Chấm đỏ trên chuông = có thông báo chưa đọc.</li>
            <li>Nhấn vào thông báo để mở trang liên quan.</li>
            <li>Có thể đánh dấu tất cả là đã đọc trong danh sách.</li>
          </ul>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard">
              Về bảng điều khiển <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
