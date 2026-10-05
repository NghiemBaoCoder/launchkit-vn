import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton } from "@/components/admin/skeletons";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <TableSkeleton rows={5} />
    </div>
  );
}
