"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { MonitorOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { signOutOthersAction } from "@/lib/actions/auth";

/** Nút "Đăng xuất các thiết bị khác" kèm hộp thoại xác nhận. */
export function SignOutOthersButton({ othersCount }: { othersCount: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  async function confirm() {
    const res = await signOutOthersAction();
    if (!res.ok) return void toast.error(res.error);
    toast.success(res.message ?? "Đã đăng xuất các thiết bị khác");
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} disabled={othersCount === 0} title={othersCount === 0 ? "Không có thiết bị nào khác đang đăng nhập" : undefined}>
        <MonitorOff /> Đăng xuất các thiết bị khác
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Đăng xuất các thiết bị khác?"
        description={`${othersCount} phiên đăng nhập khác sẽ bị huỷ ngay lập tức. Thiết bị hiện tại vẫn giữ nguyên. Nên dùng khi nghi ngờ tài khoản bị truy cập trái phép.`}
        confirmLabel="Đăng xuất thiết bị khác"
        destructive
        onConfirm={confirm}
      />
    </>
  );
}
