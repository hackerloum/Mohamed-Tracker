import {
  addLocalDays,
  eachLocalDate,
  localDate,
  monthRange,
  startOfMonthDate,
  weekRange,
} from "@/core/dates/localDate";
import { addTzs } from "@/core/money/integer";
import { CANONICAL_PRAYERS } from "@/core/types/body";
import type { LocalDate, TzsAmount } from "@/core/types/common";
import type { IanaTimezone } from "@/core/types/common";

export type InsightsRange = "today" | "week" | "month" | "year";

export interface InsightsQuery {
  range: InsightsRange;
  start: LocalDate;
  end: LocalDate;
}

export interface InsightDayPoint {
  localDate: LocalDate;
  value: number | null;
}

export interface HabitInsightInput {
  id: string;
  targetCount: number;
  archived?: boolean;
  frequency?: string;
}

export interface HabitEntryInsightInput {
  habitId: string;
  localDate: string;
  count: number;
  completed: boolean;
}

export interface PrayerInsightInput {
  localDate: string;
  prayerKey: string;
  completed: boolean;
}

export interface InsightsSource {
  range: InsightsRange;
  start: LocalDate;
  end: LocalDate;
  habits: HabitInsightInput[];
  habitEntries: HabitEntryInsightInput[];
  prayerEntries: PrayerInsightInput[];
  workouts: Array<{ localDate: string }>;
  studySessions: Array<{ localDate: string; durationMinutes: number }>;
  transactions: Array<{
    localDate: string;
    type: string;
    kind?: string;
    amount: number;
    categoryId: string;
  }>;
  days: Array<{ localDate: string; cachedScore: number | null }>;
  goals: Array<{ id: string; title: string; progressPercent: number; status: string }>;
  checkins: Array<{ localDate: string; mood?: number }>;
  sleep: Array<{ localDate: string; durationMinutes: number; quality: number }>;
}

export interface InsightsSnapshot {
  range: InsightsRange;
  start: LocalDate;
  end: LocalDate;
  habitCompletions: number;
  prayerLogs: number;
  studyMinutes: number;
  workouts: number;
  spent: TzsAmount;
  earned: TzsAmount;
  hasAnyData: boolean;
  habitCompletion: {
    completedSlots: number;
    expectedSlots: number;
    percent: number | null;
    daily: InsightDayPoint[];
  };
  prayerConsistency: {
    completed: number;
    expected: number;
    percent: number | null;
    daily: InsightDayPoint[];
  };
  workoutFrequency: {
    count: number;
    daily: InsightDayPoint[];
  };
  studyHours: {
    minutes: number;
    hours: number;
    daily: InsightDayPoint[];
  };
  expenses: {
    spent: TzsAmount;
    earned: TzsAmount;
    daily: InsightDayPoint[];
    topCategoryId: string | null;
    topCategoryAmount: TzsAmount;
  };
  dailyScores: {
    average: number | null;
    daily: InsightDayPoint[];
  };
  goalProgress: Array<{ id: string; title: string; percent: number; status: string }>;
  mood: {
    average: number | null;
    daily: InsightDayPoint[];
  };
  sleep: {
    averageMinutes: number | null;
    averageQuality: number | null;
    daily: InsightDayPoint[];
  };
}

export interface PeriodDelta {
  metric: string;
  current: number;
  previous: number;
  percentChange: number | null;
}

const CANONICAL = new Set<string>(CANONICAL_PRAYERS);

export function yearRange(
  date: Date,
  timeZone: IanaTimezone = "Africa/Dar_es_Salaam",
): { start: LocalDate; end: LocalDate } {
  const year = localDate(date, timeZone).slice(0, 4);
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function rangeFor(
  range: InsightsRange,
  date: Date,
  timeZone: IanaTimezone = "Africa/Dar_es_Salaam",
): { start: LocalDate; end: LocalDate } {
  const today = localDate(date, timeZone);
  if (range === "today") return { start: today, end: today };
  if (range === "week") return weekRange(date, timeZone);
  if (range === "month") return monthRange(date, timeZone);
  return yearRange(date, timeZone);
}

export function previousRange(
  range: InsightsRange,
  start: LocalDate,
  end: LocalDate,
): { start: LocalDate; end: LocalDate } {
  if (range === "today") {
    const previous = addLocalDays(start, -1);
    return { start: previous, end: previous };
  }
  if (range === "week") {
    return { start: addLocalDays(start, -7), end: addLocalDays(end, -7) };
  }
  if (range === "month") {
    const previousMonthLast = addLocalDays(startOfMonthDate(start), -1);
    return monthRange(new Date(`${previousMonthLast}T12:00:00.000Z`), "UTC");
  }
  const year = Number.parseInt(start.slice(0, 4), 10) - 1;
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function ratio(completed: number, expected: number): number | null {
  if (expected <= 0) return null;
  return Math.round((completed / expected) * 100);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function isExpense(type: string, kind?: string): boolean {
  return type === "expense" || kind === "expense";
}

function isIncome(type: string, kind?: string): boolean {
  return type === "income" || kind === "income";
}

function activeHabits(habits: HabitInsightInput[]): HabitInsightInput[] {
  return habits.filter((habit) => !habit.archived && habit.frequency !== "weekly");
}

function habitCompleted(entry: HabitEntryInsightInput | undefined, targetCount: number): boolean {
  if (!entry) return false;
  return entry.completed || entry.count >= Math.max(targetCount, 1);
}

export function aggregateInsights(source: InsightsSource): InsightsSnapshot {
  const dates = eachLocalDate(source.start, source.end);
  const habits = activeHabits(source.habits);
  const entriesByDayHabit = new Map<string, HabitEntryInsightInput>();
  for (const entry of source.habitEntries) {
    if (entry.localDate < source.start || entry.localDate > source.end) continue;
    entriesByDayHabit.set(`${entry.localDate}:${entry.habitId}`, entry);
  }

  const habitDaily: InsightDayPoint[] = [];
  let completedSlots = 0;
  const expectedSlots = dates.length * habits.length;
  for (const day of dates) {
    if (habits.length === 0) {
      habitDaily.push({ localDate: day, value: null });
      continue;
    }
    let done = 0;
    for (const habit of habits) {
      if (habitCompleted(entriesByDayHabit.get(`${day}:${habit.id}`), habit.targetCount)) {
        done += 1;
      }
    }
    completedSlots += done;
    habitDaily.push({ localDate: day, value: ratio(done, habits.length) });
  }

  const prayersLogged = source.prayerEntries.some(
    (entry) =>
      entry.localDate >= source.start &&
      entry.localDate <= source.end &&
      CANONICAL.has(entry.prayerKey),
  );
  const prayerSet = new Set<string>();
  for (const entry of source.prayerEntries) {
    if (!entry.completed || !CANONICAL.has(entry.prayerKey)) continue;
    if (entry.localDate < source.start || entry.localDate > source.end) continue;
    prayerSet.add(`${entry.localDate}:${entry.prayerKey}`);
  }
  const prayerDaily: InsightDayPoint[] = dates.map((day) => {
    let count = 0;
    for (const key of CANONICAL_PRAYERS) {
      if (prayerSet.has(`${day}:${key}`)) count += 1;
    }
    return { localDate: day, value: prayersLogged ? count : null };
  });
  const prayersCompleted = prayerSet.size;
  const prayersExpected = prayersLogged ? dates.length * CANONICAL_PRAYERS.length : 0;

  const workoutDaily: InsightDayPoint[] = dates.map((day) => ({
    localDate: day,
    value: source.workouts.filter((row) => row.localDate === day).length,
  }));
  const workoutCount = source.workouts.filter(
    (row) => row.localDate >= source.start && row.localDate <= source.end,
  ).length;

  const studyDaily: InsightDayPoint[] = dates.map((day) => ({
    localDate: day,
    value: source.studySessions
      .filter((row) => row.localDate === day)
      .reduce((sum, row) => sum + row.durationMinutes, 0),
  }));
  const studyMinutes = source.studySessions
    .filter((row) => row.localDate >= source.start && row.localDate <= source.end)
    .reduce((sum, row) => sum + row.durationMinutes, 0);

  let spent = 0;
  let earned = 0;
  const spendByCategory = new Map<string, number>();
  const spendByDay = new Map<string, number>();
  for (const row of source.transactions) {
    if (row.localDate < source.start || row.localDate > source.end) continue;
    if (isExpense(row.type, row.kind)) {
      spent = addTzs(spent, row.amount);
      spendByCategory.set(row.categoryId, addTzs(spendByCategory.get(row.categoryId) ?? 0, row.amount));
      spendByDay.set(row.localDate, addTzs(spendByDay.get(row.localDate) ?? 0, row.amount));
    } else if (isIncome(row.type, row.kind)) {
      earned = addTzs(earned, row.amount);
    }
  }
  const topCategory = [...spendByCategory.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const expenseDaily: InsightDayPoint[] = dates.map((day) => ({
    localDate: day,
    value: spendByDay.get(day) ?? 0,
  }));

  const scoreByDay = new Map(source.days.map((day) => [day.localDate, day.cachedScore]));
  const scoreValues: number[] = [];
  const scoreDaily: InsightDayPoint[] = dates.map((day) => {
    const score = scoreByDay.get(day) ?? null;
    if (typeof score === "number") scoreValues.push(score);
    return { localDate: day, value: score };
  });

  const moodValues: number[] = [];
  const moodByDay = new Map<string, number>();
  for (const row of source.checkins) {
    if (row.mood === undefined) continue;
    if (row.localDate < source.start || row.localDate > source.end) continue;
    moodValues.push(row.mood);
    moodByDay.set(row.localDate, row.mood);
  }
  const moodDaily: InsightDayPoint[] = dates.map((day) => ({
    localDate: day,
    value: moodByDay.get(day) ?? null,
  }));

  const sleepMinutes: number[] = [];
  const sleepQuality: number[] = [];
  const sleepByDay = new Map<string, number>();
  for (const row of source.sleep) {
    if (row.localDate < source.start || row.localDate > source.end) continue;
    sleepMinutes.push(row.durationMinutes);
    sleepQuality.push(row.quality);
    sleepByDay.set(row.localDate, row.durationMinutes);
  }
  const sleepDaily: InsightDayPoint[] = dates.map((day) => ({
    localDate: day,
    value: sleepByDay.get(day) ?? null,
  }));

  const goalProgress = source.goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    percent: goal.progressPercent,
    status: goal.status,
  }));

  const hasAnyData =
    completedSlots > 0 ||
    prayersCompleted > 0 ||
    workoutCount > 0 ||
    studyMinutes > 0 ||
    spent > 0 ||
    earned > 0 ||
    scoreValues.length > 0 ||
    moodValues.length > 0 ||
    sleepMinutes.length > 0 ||
    goalProgress.length > 0 ||
    expectedSlots > 0;

  return {
    range: source.range,
    start: source.start,
    end: source.end,
    habitCompletions: completedSlots,
    prayerLogs: prayersCompleted,
    studyMinutes,
    workouts: workoutCount,
    spent,
    earned,
    hasAnyData,
    habitCompletion: {
      completedSlots,
      expectedSlots,
      percent: habits.length === 0 ? null : ratio(completedSlots, expectedSlots),
      daily: habitDaily,
    },
    prayerConsistency: {
      completed: prayersCompleted,
      expected: prayersExpected,
      percent: prayersLogged ? ratio(prayersCompleted, prayersExpected) : null,
      daily: prayerDaily,
    },
    workoutFrequency: {
      count: workoutCount,
      daily: workoutDaily,
    },
    studyHours: {
      minutes: studyMinutes,
      hours: Math.round((studyMinutes / 60) * 10) / 10,
      daily: studyDaily,
    },
    expenses: {
      spent,
      earned,
      daily: expenseDaily,
      topCategoryId: topCategory?.[0] ?? null,
      topCategoryAmount: topCategory?.[1] ?? 0,
    },
    dailyScores: {
      average: average(scoreValues),
      daily: scoreDaily,
    },
    goalProgress,
    mood: {
      average: average(moodValues),
      daily: moodDaily,
    },
    sleep: {
      averageMinutes: average(sleepMinutes),
      averageQuality: average(sleepQuality),
      daily: sleepDaily,
    },
  };
}

export function comparePeriods(
  current: InsightsSnapshot,
  previous: InsightsSnapshot,
): PeriodDelta[] {
  const rows: Array<[string, number, number]> = [
    ["habitPercent", current.habitCompletion.percent ?? 0, previous.habitCompletion.percent ?? 0],
    ["prayers", current.prayerConsistency.completed, previous.prayerConsistency.completed],
    ["studyMinutes", current.studyHours.minutes, previous.studyHours.minutes],
    ["workouts", current.workoutFrequency.count, previous.workoutFrequency.count],
    ["spent", current.expenses.spent, previous.expenses.spent],
    ["score", current.dailyScores.average ?? 0, previous.dailyScores.average ?? 0],
    ["mood", current.mood.average ?? 0, previous.mood.average ?? 0],
    ["sleepMinutes", current.sleep.averageMinutes ?? 0, previous.sleep.averageMinutes ?? 0],
  ];
  return rows.map(([metric, curr, prev]) => ({
    metric,
    current: curr,
    previous: prev,
    percentChange: percentChange(curr, prev),
  }));
}

export function emptyInsights(query: InsightsQuery): InsightsSnapshot {
  return aggregateInsights({
    range: query.range,
    start: query.start,
    end: query.end,
    habits: [],
    habitEntries: [],
    prayerEntries: [],
    workouts: [],
    studySessions: [],
    transactions: [],
    days: [],
    goals: [],
    checkins: [],
    sleep: [],
  });
}
