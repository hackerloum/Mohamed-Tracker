import { describe, expect, it } from "vitest";
import {
  aggregateInsights,
  comparePeriods,
  previousRange,
  rangeFor,
} from "./insights";
import type { InsightsSource } from "./insights";

const empty: InsightsSource = {
  range: "week",
  start: "2026-08-24",
  end: "2026-08-30",
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

describe("rangeFor", () => {
  const now = new Date("2026-08-28T08:00:00+03:00");
  const tz = "Africa/Dar_es_Salaam";

  it("returns today, the Monday–Sunday week, the calendar month, and the calendar year", () => {
    expect(rangeFor("today", now, tz)).toEqual({ start: "2026-08-28", end: "2026-08-28" });
    expect(rangeFor("week", now, tz)).toEqual({ start: "2026-08-24", end: "2026-08-30" });
    expect(rangeFor("month", now, tz)).toEqual({ start: "2026-08-01", end: "2026-08-31" });
    expect(rangeFor("year", now, tz)).toEqual({ start: "2026-01-01", end: "2026-12-31" });
  });
});

describe("previousRange", () => {
  it("shifts a week back by seven days", () => {
    expect(previousRange("week", "2026-08-24", "2026-08-30")).toEqual({
      start: "2026-08-17",
      end: "2026-08-23",
    });
  });

  it("returns the previous calendar month", () => {
    expect(previousRange("month", "2026-08-01", "2026-08-31")).toEqual({
      start: "2026-07-01",
      end: "2026-07-31",
    });
  });

  it("returns the previous calendar year", () => {
    expect(previousRange("year", "2026-01-01", "2026-12-31")).toEqual({
      start: "2025-01-01",
      end: "2025-12-31",
    });
  });
});

describe("aggregateInsights", () => {
  it("stays empty and does not invent percents when nothing was logged", () => {
    const snapshot = aggregateInsights(empty);
    expect(snapshot.hasAnyData).toBe(false);
    expect(snapshot.habitCompletion.percent).toBeNull();
    expect(snapshot.prayerConsistency.percent).toBeNull();
    expect(snapshot.workoutFrequency.count).toBe(0);
    expect(snapshot.studyHours.minutes).toBe(0);
    expect(snapshot.expenses.spent).toBe(0);
    expect(snapshot.dailyScores.average).toBeNull();
    expect(snapshot.mood.average).toBeNull();
    expect(snapshot.sleep.averageMinutes).toBeNull();
    expect(snapshot.goalProgress).toEqual([]);
  });

  it("scores habit completion from completed entries vs expected daily slots", () => {
    const snapshot = aggregateInsights({
      ...empty,
      range: "today",
      start: "2026-08-28",
      end: "2026-08-28",
      habits: [
        { id: "h1", targetCount: 1 },
        { id: "h2", targetCount: 2 },
      ],
      habitEntries: [
        { habitId: "h1", localDate: "2026-08-28", count: 1, completed: true },
        { habitId: "h2", localDate: "2026-08-28", count: 1, completed: false },
      ],
    });
    expect(snapshot.habitCompletion.expectedSlots).toBe(2);
    expect(snapshot.habitCompletion.completedSlots).toBe(1);
    expect(snapshot.habitCompletion.percent).toBe(50);
    expect(snapshot.hasAnyData).toBe(true);
  });

  it("treats a habit as complete when count reaches the target even if completed is false", () => {
    const snapshot = aggregateInsights({
      ...empty,
      range: "today",
      start: "2026-08-28",
      end: "2026-08-28",
      habits: [{ id: "h1", targetCount: 2 }],
      habitEntries: [{ habitId: "h1", localDate: "2026-08-28", count: 2, completed: false }],
    });
    expect(snapshot.habitCompletion.completedSlots).toBe(1);
    expect(snapshot.habitCompletion.percent).toBe(100);
  });

  it("scores canonical prayers out of five per day and ignores extras", () => {
    const snapshot = aggregateInsights({
      ...empty,
      range: "today",
      start: "2026-08-28",
      end: "2026-08-28",
      prayerEntries: [
        { localDate: "2026-08-28", prayerKey: "fajr", completed: true },
        { localDate: "2026-08-28", prayerKey: "dhuhr", completed: true },
        { localDate: "2026-08-28", prayerKey: "witr", completed: true },
      ],
    });
    expect(snapshot.prayerConsistency.completed).toBe(2);
    expect(snapshot.prayerConsistency.expected).toBe(5);
    expect(snapshot.prayerConsistency.percent).toBe(40);
  });

  it("leaves prayer percent null when no prayer was logged in the range", () => {
    const snapshot = aggregateInsights({
      ...empty,
      habits: [{ id: "h1", targetCount: 1 }],
    });
    expect(snapshot.prayerConsistency.percent).toBeNull();
    expect(snapshot.prayerConsistency.completed).toBe(0);
  });

  it("sums study minutes, workout count, and integer TZS spend", () => {
    const snapshot = aggregateInsights({
      ...empty,
      studySessions: [
        { localDate: "2026-08-24", durationMinutes: 50 },
        { localDate: "2026-08-25", durationMinutes: 70 },
      ],
      workouts: [{ localDate: "2026-08-24" }, { localDate: "2026-08-26" }],
      transactions: [
        { localDate: "2026-08-24", type: "expense", amount: 25000, categoryId: "food" },
        { localDate: "2026-08-25", type: "expense", amount: 8000, categoryId: "transport" },
        { localDate: "2026-08-25", type: "income", amount: 100000, categoryId: "business" },
      ],
    });
    expect(snapshot.studyHours.minutes).toBe(120);
    expect(snapshot.studyHours.hours).toBe(2);
    expect(snapshot.workoutFrequency.count).toBe(2);
    expect(snapshot.expenses.spent).toBe(33000);
    expect(snapshot.expenses.earned).toBe(100000);
    expect(snapshot.expenses.topCategoryId).toBe("food");
    expect(snapshot.expenses.topCategoryAmount).toBe(25000);
  });

  it("averages only days that have a stored score, mood, or sleep log", () => {
    const snapshot = aggregateInsights({
      ...empty,
      days: [
        { localDate: "2026-08-24", cachedScore: 80 },
        { localDate: "2026-08-25", cachedScore: null },
        { localDate: "2026-08-26", cachedScore: 60 },
      ],
      checkins: [
        { localDate: "2026-08-24", mood: 4 },
        { localDate: "2026-08-25" },
        { localDate: "2026-08-26", mood: 2 },
      ],
      sleep: [
        { localDate: "2026-08-24", durationMinutes: 420, quality: 4 },
        { localDate: "2026-08-25", durationMinutes: 360, quality: 2 },
      ],
      goals: [{ id: "g1", title: "Save", progressPercent: 40, status: "active" }],
    });
    expect(snapshot.dailyScores.average).toBe(70);
    expect(snapshot.mood.average).toBe(3);
    expect(snapshot.sleep.averageMinutes).toBe(390);
    expect(snapshot.sleep.averageQuality).toBe(3);
    expect(snapshot.goalProgress).toEqual([
      { id: "g1", title: "Save", percent: 40, status: "active" },
    ]);
  });
});

describe("comparePeriods", () => {
  it("returns a percent change only when the previous period has a non-zero base", () => {
    const current = aggregateInsights({
      ...empty,
      studySessions: [{ localDate: "2026-08-24", durationMinutes: 142 }],
      workouts: [{ localDate: "2026-08-24" }],
    });
    const previous = aggregateInsights({
      ...empty,
      start: "2026-08-17",
      end: "2026-08-23",
      studySessions: [{ localDate: "2026-08-17", durationMinutes: 100 }],
    });
    const deltas = comparePeriods(current, previous);
    const study = deltas.find((row) => row.metric === "studyMinutes");
    const workouts = deltas.find((row) => row.metric === "workouts");
    expect(study?.percentChange).toBe(42);
    expect(workouts?.percentChange).toBeNull();
  });
});
