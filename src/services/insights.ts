import { addLocalDays, formatLocalDateHeading, startOfLocalDay } from "@/core/dates/localDate";
import { formatInTimeZone } from "date-fns-tz";
import {
  aggregateInsights,
  comparePeriods,
  previousRange,
  rangeFor,
  type InsightsRange,
  type InsightsSnapshot,
  type InsightsSource,
  type PeriodDelta,
} from "@/core/engines/insights";
import { weeklyReviewFromFacts, type WeeklyReview } from "@/core/engines/weeklyReview";
import { formatTzs } from "@/core/money/integer";
import { PRAYER_LABELS } from "@/core/types/body";
import type { Activity } from "@/core/types/activity";
import type { CheckIn } from "@/core/types/checkin";
import type { DayRecord } from "@/core/types/day";
import type { Habit, HabitEntry } from "@/core/types/habits";
import type { Note } from "@/core/types/note";
import type { PrayerEntry } from "@/core/types/prayer";
import type { Reflection } from "@/core/types/reflection";
import type { SleepEntry } from "@/core/types/sleep";
import type { StudySession } from "@/core/types/study";
import type { Task } from "@/core/types/tasks";
import type { Transaction } from "@/core/types/money";
import type { Workout } from "@/core/types/workout";
import { listActivitiesInRange } from "@/repositories/activities";
import { listDaysInRange } from "@/repositories/days";
import { listHabits } from "@/repositories/habits";
import { listHabitEntriesInRange } from "@/repositories/habitEntries";
import { listNotesInRange } from "@/repositories/notes";
import { listPrayerEntriesInRange } from "@/repositories/prayers";
import { listStudySessionsInRange } from "@/repositories/study-sessions";
import { listTasksForDate } from "@/repositories/tasks";
import { listTransactionsInRange } from "@/repositories/transactions";
import { listWorkoutsInRange } from "@/repositories/workouts";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import { createInnerServices } from "@/services/inner";
import { calendarMonth, type CalendarDayCell } from "@/core/calendar/month";
import { searchDocuments, type SearchDocument } from "@/core/search/search";
import { listCategories } from "@/repositories/categories";

export interface InsightsBundle {
  current: InsightsSnapshot;
  previous: InsightsSnapshot;
  deltas: PeriodDelta[];
  range: InsightsRange;
}

export interface DayHistory {
  localDate: string;
  heading: string;
  planned: boolean;
  score: number | null;
  habits: Array<{
    id: string;
    name: string;
    completed: boolean;
    count: number;
    targetCount: number;
  }>;
  prayers: PrayerEntry[];
  transactions: Transaction[];
  activities: Activity[];
  study: StudySession[];
  workouts: Workout[];
  reflection: Reflection | null;
  checkin: CheckIn | null;
  sleep: SleepEntry | null;
  notes: Note[];
  tasks: Task[];
}

function emptyRecords(): Omit<InsightsSource, "range" | "start" | "end"> {
  return {
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
  };
}

async function loadRecords(
  userId: string,
  start: string,
  end: string,
): Promise<Omit<InsightsSource, "range" | "start" | "end">> {
  if (!isFirebaseConfigured()) {
    return emptyRecords();
  }

  const inner = createInnerServices();
  const [
    habits,
    habitEntries,
    prayerEntries,
    workouts,
    studySessions,
    transactions,
    days,
    goals,
    checkins,
    sleep,
  ] = await Promise.all([
    listHabits(userId),
    listHabitEntriesInRange(userId, start, end),
    listPrayerEntriesInRange(userId, start, end),
    listWorkoutsInRange(userId, start, end),
    listStudySessionsInRange(userId, start, end),
    listTransactionsInRange(userId, start, end),
    listDaysInRange(userId, start, end),
    inner.goals.list(userId),
    inner.checkins.listInRange(userId, start, end),
    inner.sleep.listInRange(userId, start, end),
  ]);

  return {
    habits: habits.map((habit) => ({
      id: habit.id,
      targetCount: habit.targetCount,
      archived: habit.archived,
      frequency: habit.frequency,
    })),
    habitEntries,
    prayerEntries,
    workouts,
    studySessions,
    transactions: transactions.map((row) => ({
      localDate: row.localDate,
      type: row.type,
      kind: row.kind,
      amount: row.amount,
      categoryId: row.categoryId,
    })),
    days: days.map((day) => ({
      localDate: day.localDate,
      cachedScore: day.cachedScore,
    })),
    goals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      progressPercent: goal.progressPercent,
      status: goal.status,
    })),
    checkins,
    sleep,
  };
}

export async function loadInsightsBundle(
  userId: string,
  range: InsightsRange,
  now: Date,
  timeZone: string,
): Promise<InsightsBundle> {
  const currentRange = rangeFor(range, now, timeZone);
  const previous = previousRange(range, currentRange.start, currentRange.end);
  const records = await loadRecords(userId, previous.start, currentRange.end);
  const current = aggregateInsights({
    ...records,
    range,
    start: currentRange.start,
    end: currentRange.end,
  });
  const previousSnap = aggregateInsights({
    ...records,
    range,
    start: previous.start,
    end: previous.end,
  });
  return {
    current,
    previous: previousSnap,
    deltas: comparePeriods(current, previousSnap),
    range,
  };
}

function weekdayLabel(localDate: string, timeZone: string): string {
  return formatInTimeZone(startOfLocalDay(localDate, timeZone), timeZone, "EEEE");
}

function bestProductivityDay(
  current: InsightsSnapshot,
): { localDate: string; score: number } | null {
  let best: { localDate: string; score: number } | null = null;
  for (const point of current.dailyScores.daily) {
    if (point.value === null) continue;
    if (!best || point.value > best.score) {
      best = { localDate: point.localDate, score: point.value };
    }
  }
  return best;
}

export async function loadWeeklyReview(
  userId: string,
  now: Date,
  timeZone: string,
  categoryNames: Map<string, string>,
): Promise<WeeklyReview> {
  const bundle = await loadInsightsBundle(userId, "week", now, timeZone);
  const { current, previous } = bundle;
  const best = bestProductivityDay(current);
  const topName = current.expenses.topCategoryId
    ? (categoryNames.get(current.expenses.topCategoryId) ?? current.expenses.topCategoryId)
    : null;
  return weeklyReviewFromFacts({
    weekStart: current.start,
    weekEnd: current.end,
    habitPercent: current.habitCompletion.percent,
    previousHabitPercent: previous.habitCompletion.percent,
    prayersCompleted: current.prayerConsistency.completed,
    prayersExpected: current.prayerConsistency.expected,
    previousPrayersCompleted: previous.prayerConsistency.completed,
    studyMinutes: current.studyHours.minutes,
    previousStudyMinutes: previous.studyHours.minutes,
    workouts: current.workoutFrequency.count,
    previousWorkouts: previous.workoutFrequency.count,
    spent: current.expenses.spent,
    previousSpent: previous.expenses.spent,
    topCategoryId: current.expenses.topCategoryId,
    topCategoryName: topName,
    topCategoryAmount: current.expenses.topCategoryAmount,
    bestProductivityDay: best?.localDate ?? null,
    bestProductivityScore: best?.score ?? null,
    weekdayLabel: best ? weekdayLabel(best.localDate, timeZone) : null,
  });
}

export async function loadCalendarMonth(
  userId: string,
  monthStart: string,
): Promise<CalendarDayCell[]> {
  const year = Number.parseInt(monthStart.slice(0, 4), 10);
  const month = Number.parseInt(monthStart.slice(5, 7), 10);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = `${monthStart.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
  const gridStart = addLocalDays(monthStart, -6);
  const gridEnd = addLocalDays(monthEnd, 6);
  const [days, transactions] = await Promise.all([
    isFirebaseConfigured() ? listDaysInRange(userId, gridStart, gridEnd) : Promise.resolve([] as DayRecord[]),
    isFirebaseConfigured()
      ? listTransactionsInRange(userId, gridStart, gridEnd)
      : Promise.resolve([] as Transaction[]),
  ]);
  const scores: Record<string, number | null> = {};
  for (const day of days) {
    scores[day.localDate] = day.cachedScore;
  }
  const spend: Record<string, number> = {};
  for (const row of transactions) {
    if (row.type !== "expense") continue;
    spend[row.localDate] = (spend[row.localDate] ?? 0) + row.amount;
  }
  return calendarMonth({ monthStart, scores, spend });
}

export async function loadDayHistory(
  userId: string,
  localDate: string,
  timeZone: string,
): Promise<DayHistory> {
  const inner = createInnerServices();
  const emptyHistory = (): DayHistory => ({
    localDate,
    heading: formatLocalDateHeading(localDate, timeZone),
    planned: false,
    score: null,
    habits: [],
    prayers: [],
    transactions: [],
    activities: [],
    study: [],
    workouts: [],
    reflection: null,
    checkin: null,
    sleep: null,
    notes: [],
    tasks: [],
  });

  if (!isFirebaseConfigured()) {
    return emptyHistory();
  }

  const [
    habits,
    habitEntries,
    days,
    prayers,
    transactions,
    activities,
    study,
    workouts,
    notes,
    tasks,
    reflection,
    checkin,
    sleep,
  ] = await Promise.all([
    listHabits(userId),
    listHabitEntriesInRange(userId, localDate, localDate),
    listDaysInRange(userId, localDate, localDate),
    listPrayerEntriesInRange(userId, localDate, localDate),
    listTransactionsInRange(userId, localDate, localDate),
    listActivitiesInRange(userId, localDate, localDate),
    listStudySessionsInRange(userId, localDate, localDate),
    listWorkoutsInRange(userId, localDate, localDate),
    listNotesInRange(userId, localDate, localDate),
    listTasksForDate(userId, localDate),
    inner.reflections.getForDate(userId, localDate),
    inner.checkins.getForDate(userId, localDate),
    inner.sleep.getForDate(userId, localDate),
  ]);

  const day = days[0] ?? null;
  const entryByHabit = new Map(habitEntries.map((entry) => [entry.habitId, entry]));

  return {
    localDate,
    heading: formatLocalDateHeading(localDate, timeZone),
    planned: day?.planned ?? false,
    score: day?.cachedScore ?? null,
    habits: habits.map((habit: Habit) => {
      const entry: HabitEntry | undefined = entryByHabit.get(habit.id);
      return {
        id: habit.id,
        name: habit.name,
        completed: entry?.completed ?? false,
        count: entry?.count ?? 0,
        targetCount: habit.targetCount,
      };
    }),
    prayers,
    transactions,
    activities,
    study,
    workouts,
    reflection,
    checkin,
    sleep,
    notes,
    tasks,
  };
}

export async function searchLife(
  userId: string,
  query: string,
  today: string,
): Promise<SearchDocument[]> {
  if (!query.trim() || !isFirebaseConfigured()) {
    return [];
  }
  const start = addLocalDays(today, -89);
  const [activities, transactions, notes, habits, prayers, study, categories] = await Promise.all([
    listActivitiesInRange(userId, start, today),
    listTransactionsInRange(userId, start, today),
    listNotesInRange(userId, start, today),
    listHabits(userId),
    listPrayerEntriesInRange(userId, start, today),
    listStudySessionsInRange(userId, start, today),
    listCategories(userId),
  ]);
  const categoryNames = new Map(categories.map((row) => [row.id, row.name]));
  const documents: SearchDocument[] = [];

  for (const activity of activities) {
    documents.push({
      id: `activity:${activity.id}`,
      kind: "activity",
      title: activity.title,
      detail: activity.summary,
      haystack: `${activity.type} ${activity.title} ${activity.summary}`,
      localDate: activity.localDate,
      href: "/log",
    });
  }

  for (const row of transactions) {
    const category = categoryNames.get(row.categoryId) ?? row.categoryId;
    const amount = formatTzs(row.amount, { withCode: true });
    documents.push({
      id: `tx:${row.id}`,
      kind: "transaction",
      title: amount,
      detail: `${category}${row.note ? ` · ${row.note}` : ""}`,
      haystack: `${row.type} ${category} ${row.note ?? ""} ${row.description ?? ""} ${row.amount} ${amount}`,
      localDate: row.localDate,
      href: "/money",
    });
  }

  for (const note of notes) {
    documents.push({
      id: `note:${note.id}`,
      kind: "note",
      title: note.body.slice(0, 80) || "Note",
      detail: note.body,
      haystack: `note ${note.body}`,
      localDate: note.localDate,
      href: "/log",
    });
  }

  for (const habit of habits) {
    documents.push({
      id: `habit:${habit.id}`,
      kind: "habit",
      title: habit.name,
      detail: "Habit",
      haystack: `habit ${habit.name}`,
      localDate: today,
      href: "/more/habits",
    });
  }

  for (const prayer of prayers) {
    const label = PRAYER_LABELS[prayer.prayerKey] ?? prayer.prayerKey;
    documents.push({
      id: `prayer:${prayer.id}`,
      kind: "prayer",
      title: label,
      detail: prayer.completed ? "Logged" : "Not completed",
      haystack: `prayer ${label} ${prayer.prayerKey} ${prayer.status}`,
      localDate: prayer.localDate,
      href: "/today",
    });
  }

  for (const session of study) {
    documents.push({
      id: `study:${session.id}`,
      kind: "study",
      title: session.topic || "Study",
      detail: `${session.durationMinutes} min`,
      haystack: `study ${session.topic} ${session.notes ?? ""} ${session.note ?? ""} ${session.durationMinutes}`,
      localDate: session.localDate,
      href: "/study",
    });
  }

  return searchDocuments(query, documents);
}

export async function listCategoriesSafe(userId: string) {
  if (!isFirebaseConfigured()) return [];
  return listCategories(userId);
}
