import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Skeleton className="h-9 w-full md:max-w-sm" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="flex gap-3 border-b bg-muted/40 px-3 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-3 border-b px-3 py-3 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-2 px-5 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><TableSkeleton rows={5} cols={4} /></CardContent>
      </Card>
    </div>
  );
}

export function ListPageSkeleton({ rows, cols }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DetailSkeleton />
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
