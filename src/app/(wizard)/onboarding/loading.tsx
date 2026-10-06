import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-6">
      <div className="flex items-center justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /></div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="space-y-3 pt-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
      <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      <div className="flex justify-between pt-4"><Skeleton className="h-10 w-28 rounded-lg" /><Skeleton className="h-10 w-32 rounded-lg" /></div>
    </div>
  );
}
