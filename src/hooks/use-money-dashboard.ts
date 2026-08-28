"use client";

import { useMemo } from "react";
import {
  daysInclusive,
  localDateKey,
  monthRange,
  weekRange,
} from "@/core/dates/localDate";
import { averageDailySpend, summarizeTransactions } from "@/core/money/summary";
import { DEFAULT_TIMEZONE } from "@/core/types/money";
import { useTransactions } from "./use-transactions";

export type MoneyPeriod = "today" | "week" | "month";

export function useMoneyDashboard(
  period: MoneyPeriod,
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
) {
  const today = localDateKey(now, timeZone);
  const range = useMemo(() => {
    if (period === "today") return { start: today, end: today };
    if (period === "week") return weekRange(now, timeZone);
    return monthRange(now, timeZone);
  }, [period, today, now, timeZone]);

  const month = useMemo(() => monthRange(now, timeZone), [now, timeZone]);
  const { rows, loading, error } = useTransactions({
    start: month.start,
    end: month.end,
  });

  const summary = useMemo(
    () => summarizeTransactions(rows, range),
    [rows, range],
  );

  const monthSummary = useMemo(
    () => summarizeTransactions(rows, month),
    [rows, month],
  );

  const elapsedEnd = range.end < today ? range.end : today;
  const elapsedDays = Math.max(1, daysInclusive(range.start, elapsedEnd));

  return {
    today,
    range,
    rows,
    loading,
    error,
    summary,
    monthSummary,
    averageDaily: averageDailySpend(summary.spent, elapsedDays),
    recent: rows.slice(0, 8),
  };
}
