import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={8} />
      <TableSkeleton rows={6} cols={3} />
    </div>
  );
}
