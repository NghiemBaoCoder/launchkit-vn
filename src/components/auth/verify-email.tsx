"use client";
import * as React from "react";
import Link from "next/link";
import { MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "./auth-card";
import { resendVerificationAction } from "@/lib/actions/auth";

export function VerifyEmail({ email, verified }: { email?: string; verified?: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (verified) {
    return (
      <AuthCard title="Email đã được xác thực" description="Tài khoản của bạn đã sẵn sàng.">
        <Button asChild className="w-full"><Link href="/dashboard">Vào dashboard</Link></Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Kiểm tra email của bạn" description={email ? <>Chúng tôi đã gửi liên kết xác thực đến <strong>{email}</strong>.</> : "Chúng tôi đã gửi liên kết xác thực đến email của bạn."} footer={<Link href="/login" className="text-primary hover:underline">Quay lại đăng nhập</Link>}>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-6" /></div>
        <p className="text-sm text-muted-foreground">Bấm vào liên kết trong email để kích hoạt tài khoản. Không thấy email? Kiểm tra thư mục Spam hoặc gửi lại.</p>
        {email ? (
          <Button
            variant="outline"
            loading={loading}
            disabled={cooldown > 0}
            onClick={async () => {
              setLoading(true);
              const res = await resendVerificationAction({ email });
              setLoading(false);
              if (res.ok) {
                toast.success(res.message ?? "Đã gửi lại");
                setCooldown(60);
              } else toast.error(res.error);
            }}
          >
            <RefreshCw /> {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại email xác thực"}
          </Button>
        ) : null}
      </div>
    </AuthCard>
  );
}
