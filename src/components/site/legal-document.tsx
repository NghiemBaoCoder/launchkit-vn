import * as React from "react";
import Link from "next/link";
import { CalendarDays, Mail } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
  related?: { href: string; label: string }[];
}

export function LegalDocument({ eyebrow, title, intro, updatedAt, sections, related }: LegalDocumentProps) {
  return (
    <div>
      <div className="surface-glow border-b">
        <div className="container-x py-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden /> Cập nhật lần cuối: {updatedAt}
          </p>
        </div>
      </div>
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[260px_1fr] lg:py-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mục lục</p>
          <ol className="space-y-1 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <span className="w-5 shrink-0 tabular-nums text-xs leading-5">{i + 1}.</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
          {related?.length ? (
            <div className="mt-8 rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="mb-2 font-semibold">Tài liệu liên quan</p>
              <ul className="space-y-1.5">
                {related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-primary hover:underline">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
        <article className="min-w-0 max-w-3xl">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className={cn("scroll-mt-24", i > 0 && "mt-10 border-t pt-10")}>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                <span className="mr-2 text-primary">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="prose-legal mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5 [&_strong]:font-semibold">{s.content}</div>
            </section>
          ))}
          <div className="mt-12 rounded-2xl border bg-muted/30 p-6">
            <p className="font-semibold">Bạn có câu hỏi về tài liệu này?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Liên hệ bộ phận hỗ trợ qua{" "}
              <a href={`mailto:${SITE.supportEmail}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Mail className="size-3.5" aria-hidden /> {SITE.supportEmail}
              </a>{" "}
              hoặc trang <Link href="/contact" className="text-primary hover:underline">Liên hệ</Link>. Chúng tôi phản hồi trong 1 ngày làm việc.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
