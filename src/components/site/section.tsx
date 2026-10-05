import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Section({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({ eyebrow, title, description, align = "center", className, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p> : null}
      <Tag className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</Tag>
      {description ? <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">{description}</p> : null}
    </div>
  );
}

interface CtaBannerProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: React.ReactNode;
  className?: string;
}

export function CtaBanner({
  title,
  description,
  primaryHref = "/onboarding",
  primaryLabel = "Tạo Business Kit",
  secondaryHref,
  secondaryLabel,
  note,
  className,
}: CtaBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white shadow-xl sm:px-12 sm:py-20",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {description ? <p className="mt-4 text-balance text-base text-white/85 sm:text-lg">{description}</p> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="xl" className="bg-white text-primary shadow-lg hover:bg-white/90">
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight />
            </Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild size="xl" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
        {note ? <p className="mt-5 text-sm text-white/75">{note}</p> : null}
      </div>
    </div>
  );
}

/** Dải eyebrow + icon nhỏ dùng ở đầu trang nội dung. */
export function PageIntro({ eyebrow, title, description, className }: { eyebrow?: string; title: string; description?: string; className?: string }) {
  return (
    <div className={cn("surface-glow border-b", className)}>
      <div className="container-x py-14 sm:py-20">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
      </div>
    </div>
  );
}
