import type { Metadata } from "next";
import { AlertTriangle, KeyRound, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SignOutOthersButton } from "@/components/settings/security-actions";
import { SessionList, type SessionRow } from "@/components/settings/session-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { signOutAction } from "@/lib/actions/auth";
import { requireProfile } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Bảo mật" };

export default async function SecuritySettingsPage() {
  await requireProfile("/settings/security");
  const [supabase, settings] = await Promise.all([createClient(), getSiteSettings()]);
  const { data, error } = await supabase.rpc("get_my_sessions");
  const sessions: SessionRow[] = (data ?? []).map((s) => ({ ...s, user_agent: s.user_agent ?? null, ip: s.ip ?? null }));
  const othersCount = sessions.filter((s) => !s.is_current).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-muted-foreground" /> Đổi mật khẩu
            </CardTitle>
            <CardDescription>Nhập mật khẩu hiện tại để xác nhận, sau đó đặt mật khẩu mới.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-muted-foreground" /> Phiên đăng nhập
            </CardTitle>
            <CardDescription>Các thiết bị đang đăng nhập vào tài khoản của bạn. Tên trình duyệt / hệ điều hành chỉ hiển thị khi thiết bị cung cấp thông tin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>Không tải được danh sách phiên</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : sessions.length === 0 ? (
              <EmptyState compact icon={MonitorSmartphone} title="Chưa có phiên đăng nhập" description="Danh sách thiết bị sẽ hiển thị ở đây sau khi bạn đăng nhập." />
            ) : (
              <SessionList sessions={sessions} />
            )}
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <SignOutOthersButton othersCount={othersCount} />
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut /> Đăng xuất
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" /> Xoá tài khoản
            </CardTitle>
            <CardDescription>Xoá vĩnh viễn tài khoản cùng toàn bộ business, nội dung, tài liệu và lịch sử thanh toán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>Cần xác nhận qua hỗ trợ</AlertTitle>
              <AlertDescription>
                <p>
                  Cần xác nhận qua hỗ trợ — gửi yêu cầu tới{" "}
                  <a href={`mailto:${settings.support_email}?subject=${encodeURIComponent("Yêu cầu xoá tài khoản LaunchKit")}`} className="font-medium underline underline-offset-2">
                    {settings.support_email}
                  </a>{" "}
                  từ email đã đăng ký. Chúng tôi xử lý trong 3–5 ngày làm việc.
                </p>
              </AlertDescription>
            </Alert>
            <Button type="button" variant="destructive" className="w-full" disabled aria-disabled title="Tự xoá tài khoản chưa khả dụng — liên hệ hỗ trợ">
              <Trash2 /> Xoá tài khoản
            </Button>
            <p className="text-xs text-muted-foreground">Tính năng tự xoá chưa khả dụng để tránh mất dữ liệu ngoài ý muốn. Hành động này không thể hoàn tác.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
