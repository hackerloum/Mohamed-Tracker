import {
  addLocalDays,
  eachLocalDate,
  startOfMonthDate,
  startOfWeekMonday,
} from "@/core/dates/localDate";
import type { LocalDate } from "@/core/types/common";

export type CalendarDayTone = "empty" | "low" | "strong" | "completed";

export interface CalendarDayCell {
  localDate: LocalDate;
  inMonth: boolean;
  tone: CalendarDayTone;
  score: number | null;
  spend: number;
  spendIntensity: number;
}

export interface CalendarMonthInput {
  monthStart: LocalDate;
  scores: Record<string, number | null | undefined>;
  spend?: Record<string, number>;
}

export function dayTone(score: number | null | undefined): CalendarDayTone {
  if (score === null || score === undefined) return "empty";
  if (score >= 100) return "completed";
  if (score >= 70) return "strong";
  if (score < 40) return "low";
  return "empty";
}

function monthEnd(monthStart: LocalDate): LocalDate {
  const year = Number.parseInt(monthStart.slice(0, 4), 10);
  const month = Number.parseInt(monthStart.slice(5, 7), 10);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthStart.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}

export function calendarMonth(input: CalendarMonthInput): CalendarDayCell[] {
  const start = startOfMonthDate(input.monthStart);
  const end = monthEnd(start);
  const gridStart = startOfWeekMonday(start);
  let gridEnd = end;
  while (new Date(`${gridEnd}T12:00:00.000Z`).getUTCDay() !== 0) {
    gridEnd = addLocalDays(gridEnd, 1);
  }

  const maxSpend = Math.max(0, ...Object.values(input.spend ?? {}));
  return eachLocalDate(gridStart, gridEnd).map((localDate) => {
    const score = input.scores[localDate];
    const spend = input.spend?.[localDate] ?? 0;
    return {
      localDate,
      inMonth: localDate >= start && localDate <= end,
      tone: dayTone(typeof score === "number" ? score : null),
      score: typeof score === "number" ? score : null,
      spend,
      spendIntensity: maxSpend > 0 ? spend / maxSpend : 0,
    };
  });
}
