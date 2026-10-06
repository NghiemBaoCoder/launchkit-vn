import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton dạng danh sách cho mục Tài liệu. */
export default function DocumentsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-56" /></div><Skeleton className="h-9 w-40 rounded-lg" /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      <div className="rounded-xl border divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
