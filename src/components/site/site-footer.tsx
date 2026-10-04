import Link from "next/link";
import { Rocket } from "lucide-react";
import { SITE } from "@/lib/constants";

const GROUPS = [
  { title: "Sản phẩm", links: [{ href: "/examples", label: "Ví dụ Business Kit" }, { href: "/how-it-works", label: "Cách hoạt động" }, { href: "/pricing", label: "Bảng giá" }, { href: "/onboarding", label: "Tạo Business Kit" }] },
  { title: "Theo loại hình", links: [{ href: "/business-kit/freelancer", label: "Freelancer" }, { href: "/business-kit/creator", label: "Creator" }, { href: "/business-kit/salon", label: "Salon & Spa" }, { href: "/business-kit/online-shop", label: "Shop online" }, { href: "/business-kit/agency", label: "Agency" }] },
  { title: "Hỗ trợ", links: [{ href: "/faq", label: "Câu hỏi thường gặp" }, { href: "/contact", label: "Liên hệ" }, { href: "/refund-policy", label: "Chính sách hoàn tiền" }] },
  { title: "Pháp lý", links: [{ href: "/terms", label: "Điều khoản sử dụng" }, { href: "/privacy", label: "Chính sách bảo mật" }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="size-4" /></span>
            {SITE.name}
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}. Dành cho freelancer, creator và chủ shop nhỏ tại Việt Nam.</p>
          <p className="text-xs text-muted-foreground">Hỗ trợ: <a href={`mailto:${SITE.supportEmail}`} className="hover:underline">{SITE.supportEmail}</a></p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h4 className="mb-3 text-sm font-semibold">{g.title}</h4>
            <ul className="space-y-2">
              {g.links.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link></li>))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE.name}. Nội dung được tạo tự động mang tính tham khảo, không phải tư vấn pháp lý/tài chính.</span>
          <span>Made in Việt Nam 🇻🇳</span>
        </div>
      </div>
    </footer>
  );
}
