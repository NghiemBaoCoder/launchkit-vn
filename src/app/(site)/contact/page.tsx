import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageCircle, CircleHelp } from "lucide-react";
import { SITE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { ContactForm } from "@/components/site/contact-form";
import { Section, PageIntro } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ đội ngũ LaunchKit VN: hỗ trợ sử dụng, thanh toán & hoá đơn, hợp tác affiliate, góp ý sản phẩm. Phản hồi trong 1 ngày làm việc.",
};

export default async function ContactPage() {
  const user = await getCurrentUser();
  const defaultName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  return (
    <>
      <PageIntro eyebrow="Liên hệ" title="Chúng tôi ở đây để giúp bạn bắt đầu" description="Câu hỏi về sản phẩm, thanh toán, hợp tác hay chỉ muốn góp ý — gửi cho chúng tôi, một người thật sẽ trả lời." />
      <Section>
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">Email hỗ trợ</p>
                  <a href={`mailto:${SITE.supportEmail}`} className="text-sm text-primary hover:underline">
                    {SITE.supportEmail}
                  </a>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Kênh chính thức cho mọi yêu cầu, kể cả hoàn tiền và xuất hoá đơn.</p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">Zalo OA</p>
                  <p className="text-sm text-muted-foreground">Sắp ra mắt</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Kênh Zalo đang trong quá trình xác thực. Trong lúc chờ, vui lòng dùng form hoặc email.</p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                  <Clock className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">Giờ làm việc</p>
                  <p className="text-sm text-muted-foreground">Thứ Hai – Thứ Sáu, 9:00 – 18:00</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Phản hồi trong 1 ngày làm việc. Yêu cầu gửi cuối tuần được xử lý vào thứ Hai.</p>
            </div>
            <div className="rounded-2xl border border-dashed bg-muted/30 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CircleHelp className="size-4 text-primary" aria-hidden /> Có thể câu trả lời đã có sẵn
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li><Link href="/faq" className="text-primary hover:underline">Câu hỏi thường gặp</Link></li>
                <li><Link href="/refund-policy" className="text-primary hover:underline">Chính sách hoàn tiền</Link></li>
                <li><Link href="/how-it-works" className="text-primary hover:underline">Cách hoạt động</Link></li>
              </ul>
            </div>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-xs sm:p-8">
            <h2 className="text-xl font-bold">Gửi tin nhắn</h2>
            <p className="mt-1 text-sm text-muted-foreground">Điền thông tin bên dưới. Nếu bạn đã đăng nhập, chúng tôi sẽ gắn tin nhắn với tài khoản để hỗ trợ nhanh hơn.</p>
            <div className="mt-6">
              <ContactForm defaultEmail={user?.email ?? ""} defaultName={defaultName} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
