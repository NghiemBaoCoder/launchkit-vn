"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { GENERATION_STAGES, type StageState } from "@/lib/ai/types";
import { advanceGenerationAction, retryGenerationAction, startFullGenerationAction } from "@/lib/actions/generation";
import type { GenerationJob } from "@/types";

const TIPS = [
  "Mẹo: Gói Tiêu chuẩn nên là gói bạn muốn bán nhiều nhất — hãy làm nó nổi bật.",
  "Mẹo: Đăng 3–5 nội dung/tuần đều đặn hiệu quả hơn 20 bài trong 1 ngày.",
  "Mẹo: Luôn kết thúc tin nhắn tư vấn bằng một câu hỏi để khách dễ trả lời.",
  "Mẹo: Xin feedback ngay sau khi bàn giao — đó là lúc khách vui nhất.",
  "Mẹo: Tăng giá 10% sau mỗi 10 khách nếu lịch của bạn đã kín 80%.",
];

export function GenerationProgress({ initialJob, businessId, businessName, credits }: { initialJob: GenerationJob | null; businessId: string; businessName: string; credits: number }) {
  const router = useRouter();
  const [job, setJob] = React.useState<GenerationJob | null>(initialJob);
  const [starting, setStarting] = React.useState(false);
  const [tip, setTip] = React.useState(0);
  const running = React.useRef(false);

  const stages = React.useMemo(() => (job?.stages as unknown as StageState[]) ?? [], [job]);
  const stageMeta = (key: string) => GENERATION_STAGES.find((s) => s.key === key);
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const total = stages.length || GENERATION_STAGES.length;
  const progress = job?.status === "completed" ? 100 : Math.round((completedCount / total) * 100);

  React.useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Vòng lặp xử lý: mỗi lần gọi server xử lý đúng một stage.
  React.useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;
    if (running.current) return;
    let cancelled = false;
    running.current = true;
    (async () => {
      let current = job;
      while (!cancelled && current.status !== "completed" && current.status !== "failed") {
        const res = await advanceGenerationAction(current.id);
        if (cancelled) break;
        if (!res.ok) {
          toast.error(res.error);
          break;
        }
        current = res.data;
        setJob(current);
      }
      running.current = false;
      if (!cancelled && current.status === "completed") {
        toast.success("Business Kit đã sẵn sàng!");
        router.refresh();
      }
    })();
    return () => {
      cancelled = true;
      running.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status, job?.attempts]);

  async function retry() {
    if (!job) return;
    const res = await retryGenerationAction(job.id);
    if (res.ok) setJob(res.data);
    else toast.error(res.error);
  }

  async function start() {
    setStarting(true);
    const res = await startFullGenerationAction(businessId);
    setStarting(false);
    if (res.ok) setJob(res.data);
    else toast.error(res.error);
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="size-7" /></div>
        <h1 className="text-2xl font-bold">Sẵn sàng tạo kit cho {businessName}</h1>
        <p className="mt-2 text-muted-foreground">Việc tạo Business Kit sẽ dùng 1 credit. Bạn đang có <strong>{credits}</strong> credits.</p>
        {credits < 1 ? (
          <Alert variant="warning" className="mt-4 text-left">
            <AlertTriangle />
            <AlertTitle>Không đủ credits</AlertTitle>
            <AlertDescription>Mua Business Kit hoặc nâng cấp gói để nhận thêm credits.</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {credits >= 1 ? <Button size="lg" variant="premium" onClick={start} loading={starting}><Sparkles /> Bắt đầu tạo</Button> : <Button asChild size="lg" variant="premium"><Link href={`/checkout/business-kit?business=${businessId}`}>Mua Business Kit</Link></Button>}
          <Button asChild variant="outline" size="lg"><Link href="/dashboard">Về dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const done = job.status === "completed";
  const failed = job.status === "failed";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className={cn("mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl", done ? "bg-success/10 text-success" : failed ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
            {done ? <Check className="size-7" /> : failed ? <AlertTriangle className="size-7" /> : <Loader2 className="size-7 animate-spin" />}
          </div>
          <h1 className="text-2xl font-bold">{done ? "Business Kit đã sẵn sàng 🎉" : failed ? "Có lỗi khi tạo nội dung" : `Đang tạo Business Kit cho ${businessName}`}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{done ? "Tất cả các mục đã được tạo. Bạn có thể chỉnh sửa mọi thứ trong workspace." : failed ? job.error ?? "Vui lòng thử lại." : "Thường mất dưới 1 phút. Bạn có thể rời trang, tiến trình vẫn được lưu."}</p>
        </div>
        <Progress value={progress} className="h-2.5" indicatorClassName={cn(done && "bg-success", failed && "bg-destructive")} />
        <p className="mt-2 text-right text-xs text-muted-foreground">{completedCount}/{total} mục · {progress}%</p>

        <ol className="mt-6 grid gap-2 sm:grid-cols-2">
          {stages.map((s) => {
            const meta = stageMeta(s.key);
            return (
              <li key={s.key} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors", s.status === "completed" && "border-success/30 bg-success/5", s.status === "processing" && "border-primary/40 bg-primary/5", s.status === "failed" && "border-destructive/40 bg-destructive/5")}>
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", s.status === "completed" ? "bg-success text-success-foreground" : s.status === "processing" ? "bg-primary text-primary-foreground" : s.status === "failed" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground")}>
                  {s.status === "completed" ? <Check className="size-3.5" /> : s.status === "processing" ? <Loader2 className="size-3.5 animate-spin" /> : s.status === "failed" ? <AlertTriangle className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{meta?.label ?? s.key}</span>
                  <span className="block truncate text-xs text-muted-foreground">{s.status === "failed" ? s.error : meta?.description}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {done ? (
            <Button asChild size="lg" variant="premium"><Link href={`/business/${businessId}/overview`}>Mở workspace <ArrowRight /></Link></Button>
          ) : failed ? (
            <><Button size="lg" onClick={retry}><RefreshCw /> Thử lại</Button><Button asChild variant="outline" size="lg"><Link href="/dashboard">Về dashboard</Link></Button></>
          ) : (
            <Button asChild variant="outline"><Link href="/dashboard">Về dashboard (tiếp tục chạy nền)</Link></Button>
          )}
        </div>
      </div>
      {!done && !failed ? <p className="mt-4 animate-fade-in text-center text-sm text-muted-foreground" key={tip}>{TIPS[tip]}</p> : null}
    </div>
  );
}
