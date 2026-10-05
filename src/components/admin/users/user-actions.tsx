"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Ban, Coins, UserCog, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adjustUserCreditsAction, changeUserRoleAction, reactivateUserAction, suspendUserAction } from "@/lib/actions/admin-users";
import type { UserRole } from "@/types";

interface UserActionsProps {
  userId: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  credits: number;
  /** Người đang thao tác là chính người dùng này. */
  isSelf: boolean;
  /** Người đang thao tác là super admin. */
  actorIsSuper: boolean;
}

const creditsSchema = z.object({
  amount: z.string().trim().regex(/^-?\d+$/, "Nhập số nguyên, ví dụ 5 hoặc -3").refine((v) => Number(v) !== 0, "Số credits phải khác 0"),
  reason: z.string().trim().min(3, "Nhập lý do (tối thiểu 3 ký tự)").max(300),
});

function AdjustCreditsDialog({ open, onOpenChange, userId, credits }: { open: boolean; onOpenChange: (o: boolean) => void; userId: string; credits: number }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof creditsSchema>>({ resolver: zodResolver(creditsSchema), defaultValues: { amount: "", reason: "" } });
  const amountValue = Number(useWatch({ control: form.control, name: "amount" })) || 0;
  const after = credits + amountValue;

  React.useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: z.infer<typeof creditsSchema>) {
    const res = await adjustUserCreditsAction({ userId, amount: Number(values.amount), reason: values.reason });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã cập nhật credits");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chỉnh credits</DialogTitle>
          <DialogDescription>Số dương để cộng, số âm để trừ. Giao dịch được ghi vào lịch sử credits và người dùng sẽ nhận thông báo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Số credits</FormLabel>
                <FormControl><Input {...field} inputMode="numeric" placeholder="Ví dụ: 10 hoặc -2" autoFocus /></FormControl>
                <FormDescription>Số dư hiện tại: <b>{credits}</b> → sau điều chỉnh: <b className={after < 0 ? "text-destructive" : ""}>{after}</b></FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do</FormLabel>
                <FormControl><Textarea {...field} placeholder="Ví dụ: Đền bù lỗi generation ngày 03/10" rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {after < 0 ? <Alert variant="destructive"><AlertDescription>Số dư không thể âm. Giảm số credits trừ đi.</AlertDescription></Alert> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" loading={form.formState.isSubmitting} disabled={after < 0}>Xác nhận</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleDialog({ open, onOpenChange, userId, role }: { open: boolean; onOpenChange: (o: boolean) => void; userId: string; role: UserRole }) {
  const router = useRouter();
  const [value, setValue] = React.useState<UserRole>(role);
  const [confirm, setConfirm] = React.useState(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    // Đặt lại lựa chọn mỗi lần mở dialog
    setPrevOpen(open);
    if (open) setValue(role);
  }

  async function apply() {
    const res = await changeUserRoleAction({ userId, role: value });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã cập nhật vai trò");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi vai trò</DialogTitle>
            <DialogDescription>Admin có quyền truy cập toàn bộ khu vực quản trị. Super admin thêm quyền đổi vai trò và cài đặt site.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="role-select">Vai trò</label>
            <Select id="role-select" value={value} onChange={(e) => setValue(e.target.value as UserRole)}>
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button type="button" disabled={value === role} onClick={() => setConfirm(true)}>Tiếp tục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Xác nhận đổi vai trò"
        description={`Người dùng sẽ có vai trò "${value === "user" ? "Người dùng" : value === "admin" ? "Admin" : "Super admin"}" ngay lập tức.`}
        confirmLabel="Đổi vai trò"
        destructive={value !== "user"}
        onConfirm={apply}
      />
    </>
  );
}

const suspendSchema = z.object({ reason: z.string().trim().min(5, "Nhập lý do tạm khoá (tối thiểu 5 ký tự)").max(500) });

function SuspendDialog({ open, onOpenChange, userId, email }: { open: boolean; onOpenChange: (o: boolean) => void; userId: string; email: string }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof suspendSchema>>({ resolver: zodResolver(suspendSchema), defaultValues: { reason: "" } });
  React.useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: z.infer<typeof suspendSchema>) {
    const res = await suspendUserAction({ userId, reason: values.reason });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Đã tạm khoá tài khoản");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạm khoá tài khoản</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{email}</span> sẽ bị chặn truy cập ngay lập tức cho tới khi được mở khoá. Dữ liệu của họ được giữ nguyên.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do (người dùng sẽ thấy)</FormLabel>
                <FormControl><Textarea {...field} rows={3} placeholder="Ví dụ: Vi phạm điều khoản sử dụng — spam nội dung" autoFocus /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" variant="destructive" loading={form.formState.isSubmitting}><Ban /> Xác nhận tạm khoá</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function UserActions({ userId, email, role, status, credits, isSelf, actorIsSuper }: UserActionsProps) {
  const router = useRouter();
  const [creditsOpen, setCreditsOpen] = React.useState(false);
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const [reactivateOpen, setReactivateOpen] = React.useState(false);

  const canSuspend = !isSelf && role !== "super_admin" && (role !== "admin" || actorIsSuper);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setCreditsOpen(true)}><Coins /> Điều chỉnh credits</Button>
      {actorIsSuper && !isSelf ? (
        <Button variant="outline" size="sm" onClick={() => setRoleOpen(true)}><UserCog /> Đổi vai trò</Button>
      ) : null}
      {status === "active" ? (
        <Button variant="destructive" size="sm" onClick={() => setSuspendOpen(true)} disabled={!canSuspend} title={!canSuspend ? "Không thể khoá tài khoản này" : undefined}><Ban /> Tạm khoá</Button>
      ) : (
        <Button variant="success" size="sm" onClick={() => setReactivateOpen(true)}><Unlock /> Mở khoá</Button>
      )}

      <AdjustCreditsDialog open={creditsOpen} onOpenChange={setCreditsOpen} userId={userId} credits={credits} />
      {actorIsSuper ? <ChangeRoleDialog open={roleOpen} onOpenChange={setRoleOpen} userId={userId} role={role} /> : null}
      <SuspendDialog open={suspendOpen} onOpenChange={setSuspendOpen} userId={userId} email={email} />
      <ConfirmDialog
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        title="Mở khoá tài khoản?"
        description={`${email} sẽ có thể đăng nhập và sử dụng lại ngay lập tức.`}
        confirmLabel="Mở khoá"
        onConfirm={async () => {
          const res = await reactivateUserAction(userId);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message ?? "Đã mở khoá");
          router.refresh();
        }}
      />
    </div>
  );
}
