import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton dạng lịch cho mục Nội dung. */
export default function ContentLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-64" /></div><Skeleton className="h-9 w-36 rounded-lg" /></div>
      <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-12" /></div>
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex gap-2 pt-1"><Skeleton className="h-7 w-20 rounded-md" /><Skeleton className="h-7 w-7 rounded-md" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
