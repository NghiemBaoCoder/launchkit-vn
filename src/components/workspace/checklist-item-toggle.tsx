"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleChecklistItemAction } from "@/lib/actions/checklists";
import { cn } from "@/lib/utils";

export function ChecklistItemToggle({ id, title, done, description }: { id: string; title: string; done: boolean; description?: string | null }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(done);
  React.useEffect(() => setChecked(done), [done]);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/50">
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={async (v) => {
          const next = v === true;
          setChecked(next);
          const res = await toggleChecklistItemAction({ itemId: id, done: next });
          if (!res.ok) {
            setChecked(!next);
            toast.error(res.error);
          } else router.refresh();
        }}
      />
      <span className="min-w-0">
        <span className={cn("block text-sm", checked && "text-muted-foreground line-through")}>{title}</span>
        {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  );
}
