import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/admin/status-badge";
import { DetailList } from "@/components/admin/detail-list";
import { JsonView } from "@/components/admin/json-view";
import { getPaymentDetail } from "@/lib/data/admin-commerce";
import { formatDateTime, formatVND } from "@/lib/utils";

export const metadata = { title: "Chi tiết thanh toán" };

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPaymentDetail(id);
  if (!payment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/admin/payments" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft className="size-3" /> Thanh toán</Link>}
        title={`${payment.provider} · ${formatVND(payment.amount)}`}
        description={<span className="inline-flex flex-wrap items-center gap-2"><StatusBadge kind="payment" value={payment.status} /><span className="font-mono text-xs">{payment.provider_ref ?? payment.id}</span></span>}
      />
      {payment.error ? (
        <Alert variant="destructive">
          <AlertTitle>Lỗi từ cổng thanh toán</AlertTitle>
          <AlertDescription><p>{payment.error}</p></AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Cổng", value: payment.provider },
                { label: "Mã tham chiếu", value: <code className="font-mono text-xs">{payment.provider_ref ?? "—"}</code> },
                { label: "Số tiền", value: <span className="tabular-nums">{formatVND(payment.amount)} {payment.currency !== "VND" ? payment.currency : ""}</span> },
                { label: "Trạng thái", value: <StatusBadge kind="payment" value={payment.status} /> },
                { label: "Đơn hàng", value: payment.orders ? <Link href={`/admin/orders/${payment.orders.id}`} className="font-mono text-xs font-semibold hover:underline">{payment.orders.order_number}</Link> : "—" },
                { label: "Sản phẩm", value: payment.orders?.products?.name ?? "—" },
                { label: "Trạng thái đơn", value: payment.orders ? <StatusBadge kind="order" value={payment.orders.status} /> : "—" },
                { label: "Khách hàng", value: payment.profiles ? <Link href={`/admin/users/${payment.profiles.id}`} className="hover:underline">{payment.profiles.full_name || payment.profiles.email}</Link> : "—" },
                { label: "Email", value: <span className="break-all">{payment.profiles?.email ?? "—"}</span> },
                { label: "Tạo lúc", value: formatDateTime(payment.created_at) },
                { label: "Cập nhật", value: formatDateTime(payment.updated_at) },
                { label: "ID", value: <code className="font-mono text-[11px] text-muted-foreground">{payment.id}</code> },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sự kiện gốc (raw_event)</CardTitle>
            <CardDescription>Payload webhook nhận từ cổng thanh toán, lưu nguyên bản để đối soát.</CardDescription>
          </CardHeader>
          <CardContent>
            {payment.raw_event == null ? <p className="text-sm text-muted-foreground">Chưa nhận webhook nào cho giao dịch này.</p> : <JsonView value={payment.raw_event} maxHeight="max-h-[36rem]" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
