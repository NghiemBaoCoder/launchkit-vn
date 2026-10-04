"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { advanceGenerationAction, regenerateSectionAction } from "@/lib/actions/generation";
import type { StageKey } from "@/lib/ai/types";
import type { GenerationJob } from "@/types";

/** Chạy job tạo lại một mục và theo dõi tiến trình (gọi advance lặp lại). */
export function useRegenerate(businessId: string) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);
  const [job, setJob] = React.useState<GenerationJob | null>(null);

  const run = React.useCallback(
    async (stage: StageKey) => {
      setRunning(true);
      const started = await regenerateSectionAction(businessId, stage);
      if (!started.ok) {
        setRunning(false);
        toast.error(started.error, started.code === "insufficient_credits" ? { action: { label: "Mua credits", onClick: () => router.push(`/checkout/business-kit-pro?business=${businessId}`) } } : undefined);
        return false;
      }
      let current = started.data;
      setJob(current);
      while (current.status !== "completed" && current.status !== "failed") {
        const res = await advanceGenerationAction(current.id);
        if (!res.ok) {
          toast.error(res.error);
          setRunning(false);
          return false;
        }
        current = res.data;
        setJob(current);
      }
      setRunning(false);
      if (current.status === "completed") {
        toast.success("Đã tạo lại nội dung");
        router.refresh();
        return true;
      }
      toast.error(current.error ?? "Tạo lại thất bại");
      return false;
    },
    [businessId, router],
  );

  return { run, running, job };
}
