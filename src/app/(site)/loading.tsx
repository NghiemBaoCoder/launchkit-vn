import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div aria-busy="true" aria-label="Đang tải trang">
      <div className="surface-glow border-b">
        <div className="container-x py-16 sm:py-24">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="mt-5 h-10 w-3/4 max-w-2xl" />
          <Skeleton className="mt-3 h-10 w-1/2 max-w-xl" />
          <Skeleton className="mt-6 h-5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-5 w-2/3 max-w-lg" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-44 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="container-x py-16">
        <Skeleton className="mx-auto h-8 w-72" />
        <Skeleton className="mx-auto mt-3 h-5 w-96 max-w-full" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
