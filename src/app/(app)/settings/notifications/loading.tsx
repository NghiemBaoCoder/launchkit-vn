import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationSettingsLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
