"use client";
import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRegenerate } from "@/hooks/use-run-job";
import type { StageKey } from "@/lib/ai/types";

interface RegenerateButtonProps extends Omit<ButtonProps, "onClick"> {
  businessId: string;
  stage: StageKey;
  label?: string;
  /** Mô tả hệ quả (ví dụ: sẽ thay thế toàn bộ dịch vụ hiện có). */
  warning?: string;
  freeRegeneration?: boolean;
}

export function RegenerateButton({ businessId, stage, label = "Tạo lại", warning, freeRegeneration, variant = "outline", size = "sm", ...props }: RegenerateButtonProps) {
  const { run, running } = useRegenerate(businessId);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)} loading={running} {...props}>
        <RefreshCw /> {running ? "Đang tạo…" : label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Tạo lại mục này?`}
        description={`${warning ?? "Nội dung hiện tại sẽ được lưu vào lịch sử phiên bản và thay bằng bản mới."} ${freeRegeneration ? "Gói của bạn được tạo lại miễn phí." : "Thao tác này dùng 1 credit."}`}
        confirmLabel="Tạo lại"
        onConfirm={async () => {
          await run(stage);
        }}
      />
    </>
  );
}
