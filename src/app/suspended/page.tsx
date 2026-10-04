import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Tài khoản bị tạm khoá" };

export default function SuspendedPage() {
  return (
    <div className="surface-glow flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><Lock className="size-8" /></div>
      <h1 className="text-3xl font-bold">Tài khoản đã bị tạm khoá</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Tài khoản của bạn đang bị tạm ngưng do vi phạm điều khoản hoặc theo yêu cầu kiểm tra. Vui lòng liên hệ <a className="text-primary hover:underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> để được hỗ trợ.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <form action={signOutAction}><Button type="submit" variant="outline">Đăng xuất</Button></form>
        <Button asChild><Link href="/contact">Liên hệ hỗ trợ</Link></Button>
      </div>
    </div>
  );
}
