"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVND } from "@/lib/utils";
import { updateAssetAction } from "@/lib/actions/assets";
import type { BusinessAsset } from "@/types";

interface CalcState {
  cost_items: { name: string; amount: number }[];
  hours_per_unit: number;
  hourly_rate_target: number;
  target_margin: number;
  /** Giá bán để tính biên lợi nhuận. */
  sell_price?: number;
}

export function PricingCalculators({ asset, anchorPrice }: { asset: BusinessAsset | undefined; anchorPrice: number }) {
  const router = useRouter();
  const initial = React.useMemo<CalcState>(() => {
    const c = (asset?.content ?? {}) as Partial<CalcState>;
    return { cost_items: c.cost_items ?? [], hours_per_unit: c.hours_per_unit ?? 10, hourly_rate_target: c.hourly_rate_target ?? 200000, target_margin: c.target_margin ?? 0.45, sell_price: c.sell_price ?? anchorPrice };
  }, [asset, anchorPrice]);
  const [state, setState] = React.useState<CalcState>(initial);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => setState(initial), [initial]);

  const materialCost = state.cost_items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const laborCost = state.hours_per_unit * state.hourly_rate_target;
  const totalCost = materialCost + laborCost;
  const suggested = totalCost / Math.max(0.05, 1 - state.target_margin);
  const sell = state.sell_price ?? anchorPrice;
  const profit = sell - totalCost;
  const margin = sell > 0 ? profit / sell : 0;

  async function save() {
    if (!asset) return toast.error("Chưa có dữ liệu máy tính. Hãy tạo lại bảng giá.");
    setSaving(true);
    const res = await updateAssetAction({ assetId: asset.id, content: { ...(asset.content as Record<string, unknown>), ...state } });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Đã lưu máy tính");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Máy tính chi phí</CardTitle><CardDescription>Tính giá vốn một đơn vị dịch vụ để định giá không lỗ.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chi phí trực tiếp / đơn vị</Label>
            {state.cost_items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <Input value={it.name} placeholder="Tên chi phí" onChange={(e) => setState((s) => ({ ...s, cost_items: s.cost_items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))} />
                <Input type="number" className="w-36" value={it.amount} onChange={(e) => setState((s) => ({ ...s, cost_items: s.cost_items.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)) }))} />
                <Button variant="ghost" size="icon" onClick={() => setState((s) => ({ ...s, cost_items: s.cost_items.filter((_, j) => j !== i) }))} aria-label="Xoá"><Trash2 /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setState((s) => ({ ...s, cost_items: [...s.cost_items, { name: "", amount: 0 }] }))}><Plus /> Thêm chi phí</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Giờ công / đơn vị</Label><Input type="number" step={0.5} value={state.hours_per_unit} onChange={(e) => setState((s) => ({ ...s, hours_per_unit: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5"><Label>Giá giờ công mục tiêu</Label><Input type="number" step={10000} value={state.hourly_rate_target} onChange={(e) => setState((s) => ({ ...s, hourly_rate_target: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Biên lợi nhuận mục tiêu ({Math.round(state.target_margin * 100)}%)</Label><input type="range" min={10} max={80} value={Math.round(state.target_margin * 100)} onChange={(e) => setState((s) => ({ ...s, target_margin: Number(e.target.value) / 100 }))} className="w-full accent-primary" /></div>
          </div>
          <dl className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="flex justify-between"><dt>Chi phí trực tiếp</dt><dd>{formatVND(materialCost)}</dd></div>
            <div className="flex justify-between"><dt>Chi phí công</dt><dd>{formatVND(laborCost)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Giá vốn / đơn vị</dt><dd>{formatVND(totalCost)}</dd></div>
            <div className="flex justify-between text-base font-bold text-primary"><dt>Giá bán gợi ý</dt><dd>{formatVND(Math.round(suggested / 1000) * 1000)}</dd></div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Máy tính biên lợi nhuận</CardTitle><CardDescription>Nhập giá bán thực tế để xem lợi nhuận mỗi đơn.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Giá bán</Label><Input type="number" step={10000} value={sell} onChange={(e) => setState((s) => ({ ...s, sell_price: Number(e.target.value) }))} /></div>
          <dl className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="flex justify-between"><dt>Giá vốn</dt><dd>{formatVND(totalCost)}</dd></div>
            <div className="flex justify-between"><dt>Lợi nhuận / đơn</dt><dd className={profit >= 0 ? "text-success" : "text-destructive"}>{formatVND(profit)}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Biên lợi nhuận</dt><dd className={margin >= state.target_margin ? "text-success" : "text-warning-foreground"}>{(margin * 100).toFixed(1)}%</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">{margin >= state.target_margin ? "Đạt biên lợi nhuận mục tiêu." : `Thấp hơn mục tiêu ${Math.round(state.target_margin * 100)}%. Cân nhắc tăng giá hoặc giảm chi phí.`}</p>
          <div className="flex justify-end"><Button onClick={save} loading={saving} disabled={!asset}><Save /> Lưu máy tính</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
