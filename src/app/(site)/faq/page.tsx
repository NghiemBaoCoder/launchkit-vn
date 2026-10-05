import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Package, Mail, UserRound, Wrench, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ_GROUPS } from "@/components/site/faq-data";
import { FaqList } from "@/components/site/faq-list";
import { Section, PageIntro } from "@/components/site/section";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: "Giải đáp về Business Kit, thanh toán và hoàn tiền, tài khoản, xuất file, website kit và AI tạo nội dung.",
};

const GROUP_ICON: Record<string, LucideIcon> = { product: Package, payment: CreditCard, account: UserRound, technical: Wrench };

export default function FaqPage() {
  const total = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Câu hỏi thường gặp" description={`${total} câu trả lời về sản phẩm, thanh toán, tài khoản và kỹ thuật. Không thấy câu hỏi của bạn? Nhắn cho chúng tôi.`} />
      <Section>
        <div className="container-x grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chủ đề</p>
            <nav className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col" aria-label="Nhóm câu hỏi">
              {FAQ_GROUPS.map((g) => {
                const Icon = GROUP_ICON[g.key] ?? Package;
                return (
                  <a key={g.key} href={`#${g.key}`} className="flex shrink-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:bg-accent/40">
                    <Icon className="size-4 text-primary" aria-hidden />
                    <span>{g.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{g.items.length}</span>
                  </a>
                );
              })}
            </nav>
            <div className="mt-8 hidden rounded-2xl border bg-muted/30 p-5 lg:block">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-primary" aria-hidden /> Vẫn chưa có câu trả lời?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Gửi câu hỏi, chúng tôi phản hồi trong 1 ngày làm việc.</p>
              <Button asChild size="sm" className="mt-3 w-full">
                <Link href="/contact">Liên hệ hỗ trợ</Link>
              </Button>
            </div>
          </aside>
          <div className="space-y-12">
            {FAQ_GROUPS.map((g) => {
              const Icon = GROUP_ICON[g.key] ?? Package;
              return (
                <section key={g.key} id={g.key} className="scroll-mt-24">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold">{g.title}</h2>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                    </div>
                  </div>
                  <FaqList items={g.items} idPrefix={`faq-${g.key}`} />
                </section>
              );
            })}
            <div className="rounded-2xl border bg-muted/30 p-6 text-center lg:hidden">
              <p className="font-semibold">Vẫn chưa có câu trả lời?</p>
              <p className="mt-1 text-sm text-muted-foreground">Gửi câu hỏi, chúng tôi phản hồi trong 1 ngày làm việc.</p>
              <Button asChild className="mt-4">
                <Link href="/contact">Liên hệ hỗ trợ</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
