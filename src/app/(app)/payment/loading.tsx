import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="mx-auto h-16 w-16 rounded-full" />
      <Skeleton className="mx-auto h-8 w-64" />
      <Skeleton className="mx-auto h-4 w-80 max-w-full" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
