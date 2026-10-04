import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { MockGateway } from "@/components/commerce/mock-gateway";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { expireStaleOrders } from "@/lib/payments/fulfill";
import { isUuid } from "@/lib/payments/orders";
import { isPast } from "@/lib/payments/time";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Cổng thanh toán (mock)" };

export default async function MockPayPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  await requireProfile(`/checkout/pay/${paymentId}`);
  if (!isUuid(paymentId)) notFound();
  await expireStaleOrders();

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, amount, currency, order_id, orders(id, order_number, status, expires_at, total, business_id, products(name), businesses(name))")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) notFound();
  const order = payment.orders as { id: string; order_number: string; status: OrderStatus; expires_at: string; total: number; business_id: string | null; products: { name: string } | null; businesses: { name: string } | null } | null;
  if (!order) notFound();

  if (order.status === "paid") redirect(`/payment/success?order=${order.id}`);
  if (order.status === "expired" || isPast(order.expires_at)) redirect(`/payment/failed?order=${order.id}&reason=expired`);
  if (order.status !== "pending" || payment.status !== "pending") redirect(`/payment/failed?order=${order.id}`);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow="Mock Payment" title="Xác nhận thanh toán" description="Trang này mô phỏng cổng thanh toán. Chọn kết quả để tiếp tục." />
      <MockGateway paymentId={payment.id} orderNumber={order.order_number} productName={order.products?.name ?? "Sản phẩm"} businessName={order.businesses?.name ?? null} amount={payment.amount} expiresAt={order.expires_at} />
    </div>
  );
}
