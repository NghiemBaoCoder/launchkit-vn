import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { SITE } from "@/lib/constants";
import { Logo } from "@/components/site/logo";
import type { Brand } from "@/components/app/brand-mark";

const GROUPS = [
  { title: "Sản phẩm", links: [{ href: "/examples", label: "Ví dụ Business Kit" }, { href: "/how-it-works", label: "Cách hoạt động" }, { href: "/pricing", label: "Bảng giá" }, { href: "/onboarding", label: "Tạo Business Kit" }] },
  { title: "Theo loại hình", links: [{ href: "/business-kit/freelancer", label: "Freelancer" }, { href: "/business-kit/creator", label: "Creator" }, { href: "/business-kit/salon", label: "Salon & Spa" }, { href: "/business-kit/online-shop", label: "Shop online" }, { href: "/business-kit/agency", label: "Agency" }] },
  { title: "Hỗ trợ", links: [{ href: "/faq", label: "Câu hỏi thường gặp" }, { href: "/contact", label: "Liên hệ" }, { href: "/refund-policy", label: "Chính sách hoàn tiền" }] },
  { title: "Pháp lý", links: [{ href: "/terms", label: "Điều khoản sử dụng" }, { href: "/privacy", label: "Chính sách bảo mật" }] },
];

export function SiteFooter({ brand = { name: SITE.name, logoUrl: null }, supportEmail = SITE.supportEmail }: { brand?: Brand; supportEmail?: string }) {
  return (
    <footer className="relative overflow-hidden border-t bg-muted/30">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 w-[60%] rounded-full bg-primary/10 blur-3xl" />
      <div className="container-x relative grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] sm:py-14">
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold" aria-label={`${brand.name} — Trang chủ`}>
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt="" className="size-9 rounded-lg object-contain" />
            ) : (
              <Logo className="size-9" title={brand.name} />
            )}
            <span className="text-lg">{brand.name}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}. Dành cho freelancer, creator và chủ shop nhỏ tại Việt Nam.</p>
          <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <Mail className="size-3.5" aria-hidden /> {supportEmail}
          </a>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h4 className="mb-3 text-sm font-semibold">{g.title}</h4>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="relative border-t">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} {brand.name}. Nội dung được tạo tự động mang tính tham khảo, không phải tư vấn pháp lý/tài chính.</span>
          <span>Made in Việt Nam 🇻🇳</span>
        </div>
      </div>
    </footer>
  );
}
