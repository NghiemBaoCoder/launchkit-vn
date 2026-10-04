import { GENERATION_STAGES, type StageState } from "@/lib/ai/types";
import { StatusBadge } from "./status-badge";
import { formatDateTime } from "@/lib/utils";

const LABELS: Record<string, string> = Object.fromEntries(GENERATION_STAGES.map((s) => [s.key, s.label]));

export function stageLabel(key: string): string {
  return LABELS[key] ?? key;
}

/** Danh sách stage của một generation job. */
export function StageList({ stages, compact }: { stages: unknown; compact?: boolean }) {
  const list = Array.isArray(stages) ? (stages as StageState[]) : [];
  if (!list.length) return <p className="text-sm text-muted-foreground">Không có stage.</p>;
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {list.map((s) => (
          <span key={s.key} title={`${stageLabel(s.key)}: ${s.status}${s.error ? ` — ${s.error}` : ""}`}>
            <StatusBadge kind="stage" value={s.status} className="px-1.5 text-[10px]" />
          </span>
        ))}
      </div>
    );
  }
  return (
    <ol className="divide-y rounded-lg border">
      {list.map((s, i) => (
        <li key={s.key} className="flex flex-col gap-1 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
            <span className="font-medium">{stageLabel(s.key)}</span>
            <StatusBadge kind="stage" value={s.status} />
          </div>
          <div className="text-xs text-muted-foreground sm:text-right">
            {s.completed_at ? formatDateTime(s.completed_at) : s.started_at ? `bắt đầu ${formatDateTime(s.started_at)}` : ""}
            {s.error ? <div className="text-destructive">{s.error}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
