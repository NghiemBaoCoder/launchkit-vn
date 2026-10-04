"use client";
import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "./button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
  successMessage?: string;
}

function CopyButton({ value, label = "Sao chép", successMessage = "Đã sao chép vào clipboard", variant = "outline", size = "sm", ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Không thể sao chép. Hãy chọn và copy thủ công.");
    }
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={copy} {...props}>
      {copied ? <Check className="text-success" /> : <Copy />}
      {size?.toString().startsWith("icon") ? <span className="sr-only">{label}</span> : label}
    </Button>
  );
}

export { CopyButton };
