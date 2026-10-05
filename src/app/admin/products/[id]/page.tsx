import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductAdmin } from "@/lib/data/admin-commerce";
import { formatDateTime, formatNumber, formatVND } from "@/lib/utils";

export const metadata = { title: "Sửa sản phẩm" };

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductAdmin(id);
  if (!data) notFound();
  const { product, stats } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/admin/products" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft className="size-3" /> Sản phẩm</Link>}
        title={product.name}
        description={<span className="inline-flex flex-wrap items-center gap-2"><code className="text-xs">{product.slug}</code><StatusBadge kind="productKind" value={product.kind} />{product.active ? null : <span className="text-warning-foreground">Đang ẩn</span>}<span className="text-xs text-muted-foreground">Cập nhật {formatDateTime(product.updated_at)}</span></span>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Đơn đã thanh toán" value={formatNumber(stats.paidCount)} />
        <StatCard label="Doanh thu" value={formatVND(stats.revenue)} />
        <StatCard label="Quyền đã cấp" value={formatNumber(stats.entitlementCount)} hint="entitlements gắn với sản phẩm" />
      </div>
      <ProductForm product={product} />
    </div>
  );
}
