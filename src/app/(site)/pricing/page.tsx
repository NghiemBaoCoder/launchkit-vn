import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, CreditCard, ShieldCheck, Undo2 } from "lucide-react";
import { getProducts } from "@/lib/data/catalog";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import { PlanComparison, PricingPlans } from "@/components/site/pricing-plans";
import { Section, SectionHeading, CtaBanner, PageIntro } from "@/components/site/section";
import { FaqList } from "@/components/site/faq-list";
import { PAYMENT_FAQ } from "@/components/site/faq-data";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "Bắt đầu miễn phí. Business Kit 299.000đ (thanh toán một lần), Business Kit Pro 599.000đ có Website Kit, Pro Membership 199.000đ/tháng cho người làm nhiều dự án. Hoàn tiền 7 ngày.",
};

const ASSURANCES = [
  { icon: Undo2, title: "Hoàn tiền 7 ngày", description: "Nếu chưa xuất hoặc tải tài liệu nào, bạn được hoàn 100%." },
  { icon: CreditCard, title: "Thanh toán an toàn", description: "Bản demo dùng cổng thanh toán mô phỏng, không trừ tiền thật." },
  { icon: ShieldCheck, title: "Dùng vĩnh viễn", description: "Business Kit và Pro trả một lần, không phí ẩn, không hết hạn." },
];

export default async function PricingPage() {
  const products = await getProducts();
  return (
    <>
      <React.Suspense fallback={null}>
        <AnalyticsTracker event="pricing_view" />
      </React.Suspense>
      <PageIntro eyebrow="Bảng giá" title="Trả một lần, dùng mãi mãi" description="Bắt đầu miễn phí với bản xem trước. Mở khoá toàn bộ Business Kit khi bạn đã thấy hợp — không phí ẩn, không ràng buộc." />

      <Section className="pb-10">
        <div className="container-x">
          <PricingPlans products={products} />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-4 text-center sm:flex-row sm:text-left">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BadgePercent className="size-5" aria-hidden />
            </span>
            <p className="text-sm">
              <span className="font-semibold">Nhập mã DEMO50 để giảm 50% (bản demo).</span> <span className="text-muted-foreground">Mã nhập ở bước thanh toán, áp dụng cho đơn đầu tiên của mỗi tài khoản.</span>
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ASSURANCES.map((a) => (
              <div key={a.title} className="flex gap-3 rounded-2xl border bg-card p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <a.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="border-t bg-muted/30" id="compare">
        <div className="container-x">
          <SectionHeading eyebrow="So sánh chi tiết" title="Gói nào mở khoá những gì" description="Quyền truy cập (entitlement) được cấp ngay sau khi thanh toán. Business Kit áp dụng cho một business; Pro Membership áp dụng cho toàn tài khoản." />
          <div className="mt-10">
            <PlanComparison products={products} />
          </div>
        </div>
      </Section>

      <Section id="faq">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading align="left" eyebrow="Thanh toán" title="Câu hỏi về thanh toán & hoàn tiền" description="Nếu chưa tìm thấy câu trả lời, hãy xem trang FAQ đầy đủ hoặc nhắn cho chúng tôi." />
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link href="/refund-policy" className="rounded-full border px-3 py-1.5 hover:bg-accent">Chính sách hoàn tiền</Link>
              <Link href="/faq" className="rounded-full border px-3 py-1.5 hover:bg-accent">FAQ đầy đủ</Link>
              <Link href="/contact" className="rounded-full border px-3 py-1.5 hover:bg-accent">Liên hệ</Link>
            </div>
          </div>
          <FaqList items={PAYMENT_FAQ} idPrefix="pricing-faq" defaultOpenFirst />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="container-x">
          <CtaBanner title="Chưa chắc? Bắt đầu miễn phí" description="Tạo bản xem trước, xem chất lượng nội dung rồi mới quyết định mua. Không cần thẻ." primaryLabel="Tạo bản xem trước miễn phí" secondaryHref="/examples" secondaryLabel="Xem ví dụ" />
        </div>
      </Section>
    </>
  );
}
