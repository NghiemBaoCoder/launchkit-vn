import { cn } from "@/lib/utils";

/** Hiển thị JSON đã format trong khối <pre> cuộn được. */
export function JsonView({ value, className, maxHeight = "max-h-96" }: { value: unknown; className?: string; maxHeight?: string }) {
  let text: string;
  try {
    text = value === undefined ? "—" : JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return (
    <pre className={cn("overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/90", maxHeight, className)}>
      {text}
    </pre>
  );
}
