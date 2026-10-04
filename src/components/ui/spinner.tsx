import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm text-muted-foreground", className)} role="status">
      <Loader2 className="size-4 animate-spin" />
      {label ? <span>{label}</span> : <span className="sr-only">Đang tải</span>}
    </div>
  );
}

export { Spinner };
