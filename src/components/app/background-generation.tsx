"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { advanceGenerationAction } from "@/lib/actions/generation";

export interface ActiveJob {
  id: string;
  businessId: string;
  businessName: string;
}

/**
 * Tiếp tục chạy các generation job đang dở (pending/processing) trong khi người dùng
 * ở bất kỳ trang nào của app — mỗi lần gọi server xử lý một stage (an toàn serverless).
 * Trang /generate/[id] tự có vòng lặp riêng nên component này bỏ qua khi đang ở đó.
 */
export function BackgroundGeneration({ jobs }: { jobs: ActiveJob[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const running = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (pathname.startsWith("/generate/")) return;
    let cancelled = false;
    for (const job of jobs) {
      if (running.current.has(job.id)) continue;
      running.current.add(job.id);
      (async () => {
        let status: string = "processing";
        let failures = 0;
        while (!cancelled && status !== "completed" && status !== "failed") {
          const res = await advanceGenerationAction(job.id);
          if (cancelled) break;
          if (!res.ok) {
            failures += 1;
            if (failures >= 3) {
              toast.error(`Không thể tiếp tục tạo kit "${job.businessName}": ${res.error}`);
              break;
            }
            await new Promise((r) => setTimeout(r, 1500 * failures));
            continue;
          }
          status = res.data.status;
        }
        running.current.delete(job.id);
        if (cancelled) return;
        if (status === "completed") {
          toast.success(`Business Kit "${job.businessName}" đã sẵn sàng!`, {
            action: { label: "Mở workspace", onClick: () => router.push(`/business/${job.businessId}/overview`) },
            duration: 8000,
          });
          router.refresh();
        } else if (status === "failed") {
          toast.error(`Tạo kit "${job.businessName}" bị lỗi ở một bước.`, {
            action: { label: "Xem & thử lại", onClick: () => router.push(`/generate/${job.businessId}`) },
            duration: 10000,
          });
          router.refresh();
        }
      })();
    }
    return () => {
      cancelled = true;
      running.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.map((j) => j.id).join(","), pathname.startsWith("/generate/")]);

  if (jobs.length === 0 || pathname.startsWith("/generate/")) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4 lg:bottom-4" aria-live="polite">
      <Link href={`/generate/${jobs[0].businessId}`} className="pointer-events-auto glass flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-primary animate-ping-soft" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        Đang tạo kit “{jobs[0].businessName}”{jobs.length > 1 ? ` +${jobs.length - 1}` : ""} · Xem tiến trình
      </Link>
    </div>
  );
}
