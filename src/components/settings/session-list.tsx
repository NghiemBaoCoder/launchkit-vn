import { Monitor, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { parseUserAgent } from "./user-agent";

export interface SessionRow {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string | null;
  ip: string | null;
  is_current: boolean;
}

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  return (
    <ul className="divide-y">
      {sessions.map((s) => {
        const ua = parseUserAgent(s.user_agent);
        const Icon = ua.mobile ? Smartphone : Monitor;
        return (
          <li key={s.id} className="flex items-start gap-3 py-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{ua.label}</span>
                {s.is_current ? <Badge variant="success">Thiết bị này</Badge> : null}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>IP {s.ip || "—"}</span>
                <span>Hoạt động {timeAgo(s.updated_at) || "—"}</span>
                <span>Đăng nhập {formatDateTime(s.created_at)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
