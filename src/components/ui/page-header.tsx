import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}

function PageHeader({ title, description, actions, eyebrow, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)} {...props}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
