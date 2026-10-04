"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { listNotificationsAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import type { Notification } from "@/types";
import { cn, timeAgo } from "@/lib/utils";

const TYPE_ICON: Record<string, string> = {
  business_generated: "🎉", section_regenerated: "✨", generation_failed: "⚠️", export_ready: "📦", export_failed: "⚠️", payment_success: "✅", payment_failed: "❌", credits_low: "🔋", kit_unlocked: "🔓", credits_adjusted: "💳", account: "👤", system: "📣",
};

export function NotificationsDropdown({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Notification[] | null>(null);
  const [unread, setUnread] = React.useState(initialUnread);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => setUnread(initialUnread), [initialUnread]);

  async function load() {
    setLoading(true);
    const res = await listNotificationsAction();
    setLoading(false);
    if (res.ok) {
      setItems(res.data.items);
      setUnread(res.data.unread);
    } else toast.error(res.error);
  }

  React.useEffect(() => {
    if (open) void load();
  }, [open]);

  async function onItemClick(n: Notification) {
    if (!n.read_at) {
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? prev);
      setUnread((u) => Math.max(0, u - 1));
      await markNotificationReadAction(n.id);
    }
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  async function markAll() {
    setItems((prev) => prev?.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })) ?? prev);
    setUnread(0);
    const res = await markAllNotificationsReadAction();
    if (res.ok) toast.success(res.message);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Thông báo${unread ? ` (${unread} chưa đọc)` : ""}`}>
          <Bell />
          {unread > 0 ? <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unread > 9 ? "9+" : unread}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Thông báo</span>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={unread === 0}><CheckCheck /> Đọc tất cả</Button>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {loading && !items ? (
            <div className="space-y-3 p-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !items || items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <Inbox className="size-8 opacity-50" />
              Chưa có thông báo nào. Khi Business Kit được tạo xong hoặc có cập nhật thanh toán, bạn sẽ thấy ở đây.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => onItemClick(n)} className={cn("flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent", !n.read_at && "bg-primary/5")}>
                    <span className="text-lg leading-none">{TYPE_ICON[n.type] ?? "🔔"}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm", !n.read_at && "font-semibold")}>{n.title}</span>
                      {n.body ? <span className="line-clamp-2 block text-xs text-muted-foreground">{n.body}</span> : null}
                      <span className="block text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.read_at ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t px-3 py-2 text-center">
          <Link href="/settings/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>Cài đặt thông báo</Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
