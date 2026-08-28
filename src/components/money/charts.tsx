"use client";

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
import { formatTzs } from "@/core/money/integer";
import type { DailyAmount, NamedAmount } from "@/core/types/money";

const bronze = "#C4A574";
const muted = "#8A8175";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.[0] || payload[0].value === undefined) return null;
  return (
    <div className="rounded-md border border-[var(--atelier-hairline)] bg-[var(--atelier-surface)] px-2 py-1 text-[12px] text-[var(--atelier-text)]">
      <span className="text-[var(--atelier-muted)]">{label} · </span>
      {formatTzs(payload[0].value, { withCode: true })}
    </div>
  );
}

export function SpendTrendChart({ data }: { data: DailyAmount[] }) {
  if (data.length === 0) return null;
  const rows = data.map((row) => ({
    ...row,
    label: row.localDate.slice(8),
  }));
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
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

export function NamedAmountChart({
  data,
  names,
}: {
  data: NamedAmount[];
  names: Map<string, string>;
}) {
  if (data.length === 0) return null;
  const rows = data.map((row) => ({
    name: names.get(row.id) ?? row.id,
    amount: row.amount,
  }));
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="amount" fill={bronze} radius={[0, 4, 4, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
