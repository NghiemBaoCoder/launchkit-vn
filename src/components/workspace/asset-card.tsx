"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, History, Pencil, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StructuredEditor } from "./structured-editor";
import { ContentView } from "./content-view";
import { BrandPaletteView, TaglineView, TypographyView } from "./brand-views";
import { RegenerateButton } from "./regenerate-button";
import { contentToText } from "@/lib/workspace/labels";
import { listAssetVersionsAction, restoreAssetVersionAction, updateAssetAction } from "@/lib/actions/assets";
import { formatDateTime, cn } from "@/lib/utils";
import type { BusinessAsset, BusinessAssetVersion } from "@/types";
import type { StageKey } from "@/lib/ai/types";

interface AssetCardProps {
  asset: BusinessAsset;
  businessId: string;
  /** Stage để tạo lại cả nhóm (ví dụ brand/sales). */
  stage?: StageKey;
  canEdit?: boolean;
  freeRegeneration?: boolean;
  className?: string;
  /** Kiểu hiển thị đặc biệt (mặc định ContentView). */
  view?: "default" | "palette" | "tagline" | "typography";
  compact?: boolean;
  description?: string;
}

const SOURCE_LABEL: Record<string, string> = { generate: "Tạo tự động", regenerate: "Tạo lại", edit: "Chỉnh sửa", restore: "Khôi phục" };

export function AssetCard({ asset, businessId, stage, canEdit = true, freeRegeneration, className, view = "default", compact, description }: AssetCardProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, unknown>>(asset.content as Record<string, unknown>);
  const [saving, setSaving] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<BusinessAssetVersion[] | null>(null);
  const [restoring, setRestoring] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(asset.content as Record<string, unknown>);
  }, [asset.content]);

  async function save() {
    setSaving(true);
    const res = await updateAssetAction({ assetId: asset.id, content: draft });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Đã lưu");
    setEditing(false);
    router.refresh();
  }

  async function openHistory() {
    setHistoryOpen(true);
    if (versions) return;
    const res = await listAssetVersionsAction(asset.id);
    if (res.ok) setVersions(res.data);
    else toast.error(res.error);
  }

  async function restore(v: BusinessAssetVersion) {
    setRestoring(v.id);
    const res = await restoreAssetVersionAction({ assetId: asset.id, versionId: v.id });
    setRestoring(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message);
    setVersions(null);
    setHistoryOpen(false);
    router.refresh();
  }

  const text = contentToText(asset.content);

  return (
    <Card className={cn("gap-4", className)} id={`asset-${asset.key}`}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">{asset.title}<Badge variant="outline" className="font-normal text-muted-foreground">v{asset.version}</Badge></CardTitle>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(asset.content as Record<string, unknown>); }} disabled={saving}><X /> Huỷ</Button>
              <Button size="sm" onClick={save} loading={saving}><Check /> Lưu</Button>
            </>
          ) : (
            <>
              <CopyButton value={text} variant="ghost" size="sm" label="Sao chép" />
              {canEdit ? <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil /> Sửa</Button> : null}
              <Button size="sm" variant="ghost" onClick={openHistory}><History /> {compact ? "" : "Lịch sử"}</Button>
              {stage && canEdit ? <RegenerateButton businessId={businessId} stage={stage} freeRegeneration={freeRegeneration} variant="ghost" size="sm" label={compact ? "" : "Tạo lại"} /> : null}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <StructuredEditor value={draft as never} onChange={(v) => setDraft(v as Record<string, unknown>)} />
        ) : view === "palette" ? (
          <BrandPaletteView content={asset.content as Record<string, unknown>} />
        ) : view === "tagline" ? (
          <TaglineView content={asset.content as Record<string, unknown>} />
        ) : view === "typography" ? (
          <TypographyView content={asset.content as Record<string, unknown>} />
        ) : (
          <ContentView value={asset.content} />
        )}
      </CardContent>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử phiên bản — {asset.title}</DialogTitle>
            <DialogDescription>Khôi phục sẽ tạo một phiên bản mới với nội dung đã chọn.</DialogDescription>
          </DialogHeader>
          {!versions ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : versions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Chưa có lịch sử.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y overflow-y-auto">
              {versions.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">Phiên bản {v.version}{v.version === asset.version ? <Badge variant="success">Hiện tại</Badge> : null}<Badge variant="secondary">{SOURCE_LABEL[v.source] ?? v.source}</Badge></div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(v.created_at)}</div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{contentToText(v.content).slice(0, 180)}</p>
                  </div>
                  {v.version !== asset.version ? <Button size="sm" variant="outline" loading={restoring === v.id} onClick={() => restore(v)}><RotateCcw /> Khôi phục</Button> : null}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
