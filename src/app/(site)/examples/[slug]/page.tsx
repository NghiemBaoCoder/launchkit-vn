import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXAMPLE_KITS, getExampleBySlug, getExampleKit } from "@/lib/examples";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import { ExampleKitView } from "@/components/site/example-kit-view";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EXAMPLE_KITS.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const kit = getExampleBySlug(slug);
  if (!kit) return { title: "Không tìm thấy ví dụ" };
  return {
    title: `${kit.name} — ví dụ Business Kit cho ${kit.businessTypeName}`,
    description: kit.summary,
  };
}

export default async function ExampleDetailPage({ params }: Params) {
  const { slug } = await params;
  const example = getExampleKit(slug);
  if (!example) notFound();
  return (
    <>
      <React.Suspense fallback={null}>
        <AnalyticsTracker event="example_view" properties={{ slug, business_type: example.kit.businessTypeSlug }} />
      </React.Suspense>
      <ExampleKitView example={example} />
    </>
  );
}
