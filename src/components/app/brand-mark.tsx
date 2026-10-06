import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export interface Brand {
  name: string;
  logoUrl?: string | null;
}

/**
 * Logo + tên site, lấy từ cài đặt admin (site_name / logo_url) — dùng thống nhất
 * cho header public, app shell, admin shell và trang auth/wizard.
 */
export function BrandMark({ brand, href = "/", className, showName = true, size = "md" }: { brand: Brand; href?: string; className?: string; showName?: boolean; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-9" : size === "sm" ? "size-7" : "size-8";
  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-2 font-bold", className)} aria-label={`${brand.name} — Trang chủ`}>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt="" className={cn(dim, "shrink-0 rounded-lg object-contain")} />
      ) : (
        <Logo className={dim} title={brand.name} />
      )}
      {showName ? <span className="truncate">{brand.name}</span> : null}
    </Link>
  );
}
