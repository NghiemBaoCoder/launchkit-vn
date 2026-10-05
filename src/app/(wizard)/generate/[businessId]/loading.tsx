import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-10 text-center">
      <Skeleton className="mx-auto size-16 rounded-2xl" />
      <Skeleton className="mx-auto h-8 w-72" />
      <Skeleton className="mx-auto h-4 w-56" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="grid gap-2 sm:grid-cols-2">{Array.from({ length: 11 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
    </div>
  );
}
