"use client";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatDate, formatVND } from "@/lib/utils";

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: RevenueChartPoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-foreground">{formatDate(p.date, "EEEE, dd/MM/yyyy")}</div>
      <div className="mt-1 text-muted-foreground">Doanh thu: <span className="font-semibold text-foreground">{formatVND(p.revenue)}</span></div>
      <div className="text-muted-foreground">Đơn đã thanh toán: <span className="font-semibold text-foreground">{p.orders}</span></div>
    </div>
  );
}

/** Biểu đồ doanh thu theo ngày (một chuỗi — không cần chú giải). */
export function RevenueChart({ data, height = 260 }: { data: RevenueChartPoint[]; height?: number }) {
  const id = React.useId().replace(/:/g, "");
  const hasData = data.some((d) => d.revenue > 0);
  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Biểu đồ doanh thu theo ngày">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`rev-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(v: string) => formatDate(v, "dd/MM")} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} minTickGap={24} />
          <YAxis tickFormatter={(v: number) => formatCompact(v)} tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#rev-${id})`} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      {!hasData ? <p className="-mt-6 text-center text-xs text-muted-foreground">Chưa có doanh thu trong kỳ này.</p> : null}
    </div>
  );
}
