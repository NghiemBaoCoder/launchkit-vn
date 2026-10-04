"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveFinanceCalculationAction } from "@/lib/actions/finance";
import { formatVND, formatCompact } from "@/lib/utils";

type Item = { name: string; amount: number; note?: string; category?: string };

function useSave(businessId: string, type: string) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const save = async (data: Record<string, unknown>) => {
    setSaving(true);
    const res = await saveFinanceCalculationAction(businessId, type, data);
    setSaving(false);
    if (!res.ok) toast.error(res.error);
    else { toast.success(res.message); router.refresh(); }
  };
  return { save, saving };
}

function ItemsEditor({ items, onChange, withCategory }: { items: Item[]; onChange: (v: Item[]) => void; withCategory?: boolean }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it.name} placeholder="Khoản mục" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
          {withCategory ? <Input className="w-32" value={it.category ?? ""} placeholder="Nhóm" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))} /> : null}
          <Input type="number" className="w-40" value={it.amount} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))} />
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { name: "", amount: 0, ...(withCategory ? { category: "" } : {}) }])}><Plus /> Thêm khoản</Button>
    </div>
  );
}

export function StartupCostTool({ businessId, initial }: { businessId: string; initial: { items: Item[] } | null }) {
  const [items, setItems] = React.useState<Item[]>(initial?.items ?? []);
  const { save, saving } = useSave(businessId, "startup_cost");
  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  return (
    <Card>
      <CardHeader><CardTitle>Chi phí khởi nghiệp</CardTitle><CardDescription>Tổng vốn cần có trước khi mở bán.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <ItemsEditor items={items} onChange={setItems} />
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3"><span className="text-sm">Tổng vốn khởi nghiệp</span><span className="text-xl font-bold text-primary">{formatVND(total)}</span></div>
        <div className="flex justify-end"><Button onClick={() => save({ items, total })} loading={saving}><Save /> Lưu</Button></div>
      </CardContent>
    </Card>
  );
}

export function MonthlyExpensesTool({ businessId, initial }: { businessId: string; initial: { items: Item[] } | null }) {
  const [items, setItems] = React.useState<Item[]>(initial?.items ?? []);
  const { save, saving } = useSave(businessId, "monthly_expenses");
  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const byCat = Object.entries(items.reduce<Record<string, number>>((acc, i) => ((acc[i.category || "Khác"] = (acc[i.category || "Khác"] ?? 0) + (Number(i.amount) || 0)), acc), {})).map(([name, value]) => ({ name, value }));
  return (
    <Card>
      <CardHeader><CardTitle>Chi phí hàng tháng</CardTitle><CardDescription>Chi phí cố định để duy trì hoạt động.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <ItemsEditor items={items} onChange={setItems} withCategory />
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3"><span className="text-sm">Tổng chi phí / tháng</span><span className="text-xl font-bold text-primary">{formatVND(total)}</span></div>
        {byCat.length > 1 ? (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCat} margin={{ left: 8, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => formatCompact(Number(v))} tick={{ fontSize: 11 }} width={40} /><Tooltip formatter={(v) => formatVND(Number(v))} /><Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        <div className="flex justify-end"><Button onClick={() => save({ items, total })} loading={saving}><Save /> Lưu</Button></div>
      </CardContent>
    </Card>
  );
}

export function RevenueTargetTool({ businessId, initial }: { businessId: string; initial: { monthly_target: number; avg_order_value: number; conversion_rate: number } | null }) {
  const [s, setS] = React.useState({ monthly_target: initial?.monthly_target ?? 30_000_000, avg_order_value: initial?.avg_order_value ?? 3_000_000, conversion_rate: initial?.conversion_rate ?? 0.2 });
  const { save, saving } = useSave(businessId, "revenue_target");
  const customers = Math.ceil(s.monthly_target / Math.max(1, s.avg_order_value));
  const leads = Math.ceil(customers / Math.max(0.01, s.conversion_rate));
  return (
    <Card>
      <CardHeader><CardTitle>Mục tiêu doanh thu</CardTitle><CardDescription>Từ mục tiêu → số khách → số khách tiềm năng cần có.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Doanh thu mục tiêu / tháng</Label><Input type="number" step={1000000} value={s.monthly_target} onChange={(e) => setS((v) => ({ ...v, monthly_target: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Giá trị đơn trung bình</Label><Input type="number" step={100000} value={s.avg_order_value} onChange={(e) => setS((v) => ({ ...v, avg_order_value: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Tỷ lệ chốt ({Math.round(s.conversion_rate * 100)}%)</Label><input type="range" min={5} max={80} value={Math.round(s.conversion_rate * 100)} onChange={(e) => setS((v) => ({ ...v, conversion_rate: Number(e.target.value) / 100 }))} className="mt-3 w-full accent-primary" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/40 p-3"><div className="text-2xl font-bold">{customers}</div><div className="text-xs text-muted-foreground">khách / tháng</div></div>
          <div className="rounded-lg bg-muted/40 p-3"><div className="text-2xl font-bold">{leads}</div><div className="text-xs text-muted-foreground">khách tiềm năng / tháng</div></div>
          <div className="rounded-lg bg-muted/40 p-3"><div className="text-2xl font-bold">{Math.ceil(leads / 4.3)}</div><div className="text-xs text-muted-foreground">khách tiềm năng / tuần</div></div>
        </div>
        <div className="flex justify-end"><Button onClick={() => save({ ...s, customers_needed: customers, leads_needed: leads })} loading={saving}><Save /> Lưu</Button></div>
      </CardContent>
    </Card>
  );
}

export function ProfitTool({ businessId, initial }: { businessId: string; initial: { revenue: number; cogs_rate: number; fixed_costs: number; tax_rate: number } | null }) {
  const [s, setS] = React.useState({ revenue: initial?.revenue ?? 30_000_000, cogs_rate: initial?.cogs_rate ?? 0.2, fixed_costs: initial?.fixed_costs ?? 6_000_000, tax_rate: initial?.tax_rate ?? 0.015 });
  const { save, saving } = useSave(businessId, "profit");
  const cogs = s.revenue * s.cogs_rate;
  const gross = s.revenue - cogs;
  const tax = s.revenue * s.tax_rate;
  const net = gross - s.fixed_costs - tax;
  const series = [0.6, 0.8, 1, 1.2, 1.5].map((m) => ({ name: `${Math.round(m * 100)}%`, net: s.revenue * m - s.revenue * m * s.cogs_rate - s.fixed_costs - s.revenue * m * s.tax_rate }));
  return (
    <Card>
      <CardHeader><CardTitle>Ước tính lợi nhuận</CardTitle><CardDescription>Lợi nhuận ròng theo doanh thu, giá vốn, chi phí cố định và thuế khoán.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Doanh thu / tháng</Label><Input type="number" step={1000000} value={s.revenue} onChange={(e) => setS((v) => ({ ...v, revenue: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Chi phí cố định / tháng</Label><Input type="number" step={500000} value={s.fixed_costs} onChange={(e) => setS((v) => ({ ...v, fixed_costs: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Giá vốn ({Math.round(s.cogs_rate * 100)}% doanh thu)</Label><input type="range" min={0} max={80} value={Math.round(s.cogs_rate * 100)} onChange={(e) => setS((v) => ({ ...v, cogs_rate: Number(e.target.value) / 100 }))} className="mt-3 w-full accent-primary" /></div>
          <div className="space-y-1.5"><Label>Thuế khoán ({(s.tax_rate * 100).toFixed(1)}%)</Label><input type="range" min={0} max={100} value={Math.round(s.tax_rate * 1000)} onChange={(e) => setS((v) => ({ ...v, tax_rate: Number(e.target.value) / 1000 }))} className="mt-3 w-full accent-primary" /></div>
        </div>
        <dl className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-sm">
          <div className="flex justify-between"><dt>Lợi nhuận gộp</dt><dd>{formatVND(gross)}</dd></div>
          <div className="flex justify-between"><dt>Thuế ước tính</dt><dd>{formatVND(tax)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Lợi nhuận ròng</dt><dd className={net >= 0 ? "text-success" : "text-destructive"}>{formatVND(net)}</dd></div>
          <div className="flex justify-between"><dt>Biên ròng</dt><dd>{s.revenue > 0 ? `${((net / s.revenue) * 100).toFixed(1)}%` : "—"}</dd></div>
        </dl>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 8, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => formatCompact(Number(v))} tick={{ fontSize: 11 }} width={44} /><Tooltip formatter={(v) => formatVND(Number(v))} labelFormatter={(l) => `Doanh thu ${l} kế hoạch`} /><Area dataKey="net" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">Ước tính tham khảo, không phải tư vấn tài chính/thuế. Thuế khoán hộ kinh doanh thường 1–5% tuỳ ngành.</p>
        <div className="flex justify-end"><Button onClick={() => save({ ...s, net_profit: net })} loading={saving}><Save /> Lưu</Button></div>
      </CardContent>
    </Card>
  );
}

export function BreakEvenTool({ businessId, initial }: { businessId: string; initial: { fixed_costs: number; price_per_unit: number; variable_cost_per_unit: number } | null }) {
  const [s, setS] = React.useState({ fixed_costs: initial?.fixed_costs ?? 6_000_000, price_per_unit: initial?.price_per_unit ?? 3_000_000, variable_cost_per_unit: initial?.variable_cost_per_unit ?? 500_000 });
  const { save, saving } = useSave(businessId, "break_even");
  const contribution = s.price_per_unit - s.variable_cost_per_unit;
  const units = contribution > 0 ? Math.ceil(s.fixed_costs / contribution) : null;
  return (
    <Card>
      <CardHeader><CardTitle>Điểm hoà vốn</CardTitle><CardDescription>Cần bán bao nhiêu đơn để không lỗ mỗi tháng.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Chi phí cố định / tháng</Label><Input type="number" step={500000} value={s.fixed_costs} onChange={(e) => setS((v) => ({ ...v, fixed_costs: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Giá bán / đơn</Label><Input type="number" step={100000} value={s.price_per_unit} onChange={(e) => setS((v) => ({ ...v, price_per_unit: Number(e.target.value) }))} /></div>
          <div className="space-y-1.5"><Label>Chi phí biến đổi / đơn</Label><Input type="number" step={50000} value={s.variable_cost_per_unit} onChange={(e) => setS((v) => ({ ...v, variable_cost_per_unit: Number(e.target.value) }))} /></div>
        </div>
        <div className="rounded-lg bg-muted/40 p-4 text-center">
          {units === null ? <p className="text-sm text-destructive">Giá bán phải lớn hơn chi phí biến đổi.</p> : (<><div className="text-3xl font-bold text-primary">{units} đơn / tháng</div><div className="text-xs text-muted-foreground">≈ {formatVND(units * s.price_per_unit)} doanh thu · {Math.ceil(units / 4.3)} đơn / tuần</div></>)}
        </div>
        <div className="flex justify-end"><Button onClick={() => save({ ...s, break_even_units: units })} loading={saving}><Save /> Lưu</Button></div>
      </CardContent>
    </Card>
  );
}
