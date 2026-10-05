import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { can, recommendedProductFor, type AccessContext, type Feature } from "@/lib/access/policy";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  ctx: AccessContext;
  feature: Feature;
  businessId: string;
  /** Phần xem trước hiển thị cho user miễn phí (nội dung thật, giới hạn). */
  preview?: React.ReactNode;
  /** Nội dung đầy đủ — CHỈ render khi có quyền (không gửi dữ liệu premium xuống client khi bị khoá). */
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Số dòng giả mờ để gợi phần tiếp theo. */
  teaserLines?: number;
  className?: string;
  /** Danh sách giá trị nhận được khi mở khoá. */
  benefits?: string[];
}

const PRODUCT_LABEL: Record<string, string> = { "business-kit": "Business Kit", "business-kit-pro": "Business Kit Pro", "pro-membership": "Pro Membership" };

/**
 * Paywall tái sử dụng: preview thật + phần mờ "tiếp theo" + 1 CTA mua.
 * Khi bị khoá, `children` KHÔNG được render — bảo vệ dữ liệu ở server.
 */
export function PremiumGate({ ctx, feature, businessId, preview, children, title = "Nội dung đầy đủ dành cho Business Kit", description = "Mở khoá để xem toàn bộ, chỉnh sửa, tạo lại và xuất file.", teaserLines = 6, className, benefits }: PremiumGateProps) {
  if (can(ctx, feature)) return <>{children}</>;
  const product = recommendedProductFor(feature);
  return (
    <div className={cn("space-y-4", className)}>
      {preview ? <div>{preview}</div> : null}
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <div className="premium-blur select-none p-5 opacity-70" aria-hidden>
          {Array.from({ length: teaserLines }).map((_, i) => (
            <div key={i} className="mb-3 space-y-2">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted/80" />
              <div className="h-3 w-5/6 rounded bg-muted/60" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/90 to-transparent p-5 sm:items-center">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 text-center shadow-lg">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Lock className="size-5" /></div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            {benefits?.length ? (
              <ul className="mx-auto mt-3 max-w-xs space-y-1 text-left text-xs text-muted-foreground">
                {benefits.map((b) => (<li key={b} className="flex items-start gap-2"><Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />{b}</li>))}
              </ul>
            ) : null}
            <Button asChild variant="premium" className="mt-4 w-full">
              <Link href={`/checkout/${product}?business=${businessId}`}><Sparkles /> Mở khoá {PRODUCT_LABEL[product]}</Link>
            </Button>
            <Link href="/pricing" className="mt-2 inline-block text-xs text-muted-foreground hover:underline">So sánh các gói</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Badge nhỏ gắn cạnh tiêu đề mục bị khoá. */
export function LockedBadge({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"><Lock className="size-3" /> Premium</span>;
}
