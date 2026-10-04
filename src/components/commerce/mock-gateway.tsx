"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Info, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { simulateMockPaymentAction } from "@/lib/actions/checkout";
import { formatDateTime, formatVND } from "@/lib/utils";

interface MockGatewayProps {
  paymentId: string;
  orderNumber: string;
  productName: string;
  businessName: string | null;
  amount: number;
  expiresAt: string;
}

export function MockGateway({ paymentId, orderNumber, productName, businessName, amount, expiresAt }: MockGatewayProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState<"success" | "failed" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run(outcome: "success" | "failed") {
    setPending(outcome);
    setError(null);
    try {
      const res = await simulateMockPaymentAction(paymentId, outcome);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      if (outcome === "success") toast.success("Thanh toán thành công (mock)");
      else toast.error("Thanh toán thất bại (mock)");
      router.push(res.data.redirectTo);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="size-5 text-primary" /> Cổng thanh toán giả lập</CardTitle>
          <CardDescription>Đây là cổng thanh toán MOCK dùng cho demo/kiểm thử. Thông tin thẻ bên dưới là giá trị mẫu và không thể chỉnh sửa; không có giao dịch thật nào được thực hiện.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert variant="info">
            <Info />
            <AlertTitle>Chế độ demo</AlertTitle>
            <AlertDescription>Bấm một trong hai nút bên dưới để giả lập kết quả. Hệ thống sẽ gửi webhook có chữ ký tới máy chủ y như cổng thanh toán thật.</AlertDescription>
          </Alert>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="card_number">Số thẻ</Label>
              <Input id="card_number" value="4242 4242 4242 4242" disabled readOnly className="font-mono" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="card_name">Tên chủ thẻ</Label>
              <Input id="card_name" value="NGUYEN VAN A" disabled readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card_exp">Hết hạn</Label>
              <Input id="card_exp" value="12/30" disabled readOnly className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card_cvc">CVC</Label>
              <Input id="card_cvc" value="123" disabled readOnly className="font-mono" />
            </div>
          </div>
          {error ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Không xử lý được</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="success" size="lg" className="flex-1" onClick={() => run("success")} loading={pending === "success"} disabled={pending !== null}>
              <CheckCircle2 /> Thanh toán thành công (mock)
            </Button>
            <Button type="button" variant="outline" size="lg" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => run("failed")} loading={pending === "failed"} disabled={pending !== null}>
              <XCircle /> Thanh toán thất bại (mock)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:self-start">
        <CardHeader>
          <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Mã đơn</span><span className="font-mono font-semibold">{orderNumber}</span></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Sản phẩm</span><span className="text-right font-medium">{productName}</span></div>
          {businessName ? <div className="flex justify-between gap-3"><span className="text-muted-foreground">Business</span><span className="text-right">{businessName}</span></div> : null}
          <Separator />
          <div className="flex items-baseline justify-between gap-3"><span className="font-semibold">Số tiền</span><span className="text-2xl font-bold tracking-tight">{formatVND(amount)}</span></div>
          <p className="text-xs text-muted-foreground">Đơn hàng hết hạn lúc {formatDateTime(expiresAt)}.</p>
        </CardContent>
      </Card>
    </div>
  );
}
