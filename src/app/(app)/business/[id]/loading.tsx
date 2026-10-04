import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-72" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
    </div>
  );
}
