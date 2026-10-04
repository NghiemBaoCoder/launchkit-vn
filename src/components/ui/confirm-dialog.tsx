"use client";
import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Nếu truyền, người dùng phải gõ đúng chuỗi này mới được xác nhận. */
  typeToConfirm?: string;
  onConfirm: () => Promise<void> | void;
}

function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Xác nhận", cancelLabel = "Huỷ", destructive, typeToConfirm, onConfirm }: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const canConfirm = !typeToConfirm || typed.trim() === typeToConfirm;

  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {destructive ? (
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
            </div>
          </div>
        </AlertDialogHeader>
        {typeToConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Gõ <span className="font-mono font-semibold text-foreground">{typeToConfirm}</span> để xác nhận.
            </p>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={typeToConfirm} autoFocus />
          </div>
        ) : null}
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={handleConfirm} loading={loading} disabled={!canConfirm}>
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
