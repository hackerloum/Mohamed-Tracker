"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InsightDayPoint, PeriodDelta } from "@/core/engines/insights";
import { formatTzs } from "@/core/money/integer";

const bronze = "#C4A574";
const muted = "#8A8175";

function hasPlottable(daily: InsightDayPoint[]): boolean {
  return daily.some((point) => point.value !== null && point.value !== 0);
}

function ChartTip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | null }>;
  label?: string;
  format?: (value: number) => string;
}) {
  if (!active || payload?.[0]?.value === undefined || payload[0].value === null) {
    return null;
  }
  const value = payload[0].value;
  return (
    <div className="rounded-md border border-hairline bg-bg-raised px-2 py-1 text-[12px] text-ink">
      <span className="text-ink-muted">{label} · </span>
      {format ? format(value) : value}
    </div>
  );
}

export function InsightTrend({
  daily,
  format,
}: {
  daily: InsightDayPoint[];
  format?: (value: number) => string;
}) {
  if (!hasPlottable(daily)) return null;
  const rows = daily.map((point) => ({
    label: point.localDate.slice(8),
    value: point.value ?? 0,
  }));
  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<ChartTip format={format} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={bronze}
            fill={bronze}
            fillOpacity={0.18}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InsightBars({
  daily,
  format,
}: {
  daily: InsightDayPoint[];
  format?: (value: number) => string;
}) {
  if (!hasPlottable(daily)) return null;
  const rows = daily.map((point) => ({
    label: point.localDate.slice(8),
    value: point.value ?? 0,
  }));
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<ChartTip format={format} />} />
          <Bar dataKey="value" fill={bronze} radius={[2, 2, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompareLine({ delta }: { delta: PeriodDelta | undefined }) {
  if (!delta || delta.percentChange === null) return null;
  const direction = delta.percentChange > 0 ? "more" : "less";
  return (
    <p className="mt-2 text-[13px] text-ink-muted">
      {Math.abs(delta.percentChange)}% {direction} than the previous period.
    </p>
  );
}

export function InsightSection({
  title,
  children,
  empty,
}: {
  title: string;
  children?: ReactNode;
  empty?: string;
}) {
  return (
    <section className="border-t border-hairline py-6 first:border-t-0">
      <h2 className="mb-2 text-[13px] uppercase tracking-[0.16em] text-ink-muted">{title}</h2>
      {children ?? (empty ? <p className="text-[15px] text-ink-muted">{empty}</p> : null)}
    </section>
  );
}

export function moneyLabel(value: number): string {
  return formatTzs(value, { withCode: true });
}
