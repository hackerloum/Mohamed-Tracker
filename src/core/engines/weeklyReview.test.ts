import { describe, expect, it } from "vitest";
import { weeklyReview, weeklyReviewFromFacts } from "./weeklyReview";
import type { WeeklyReviewFacts } from "./weeklyReview";

const baseFacts: WeeklyReviewFacts = {
  weekStart: "2026-08-24",
  weekEnd: "2026-08-30",
  habitPercent: null,
  previousHabitPercent: null,
  prayersCompleted: 0,
  prayersExpected: 0,
  previousPrayersCompleted: 0,
  studyMinutes: 0,
  previousStudyMinutes: 0,
  workouts: 0,
  previousWorkouts: 0,
  spent: 0,
  previousSpent: 0,
  topCategoryId: null,
  topCategoryName: null,
  topCategoryAmount: 0,
  bestProductivityDay: null,
  bestProductivityScore: null,
  weekdayLabel: null,
};

describe("weeklyReviewFromFacts", () => {
  it("returns no copy when there is not enough stored data", () => {
    const review = weeklyReviewFromFacts(baseFacts);
    expect(review.observations).toEqual([]);
    expect(review.copy).toBe("");
  });

  it("states a study percent change only when both weeks have study time", () => {
    const review = weeklyReviewFromFacts({
      ...baseFacts,
      studyMinutes: 142,
      previousStudyMinutes: 100,
    });
    expect(review.observations).toContain("You studied 42% more than last week.");
  });

  it("does not invent a percent when last week had zero study minutes", () => {
    const review = weeklyReviewFromFacts({
      ...baseFacts,
      studyMinutes: 90,
      previousStudyMinutes: 0,
    });
    expect(review.observations.some((line) => line.includes("%"))).toBe(false);
    expect(review.observations).toContain("Study this week: 1.5 hours.");
  });

  it("reports habit, prayer, workout, money, top category, and best day from facts", () => {
    const review = weeklyReviewFromFacts({
      ...baseFacts,
      habitPercent: 80,
      previousHabitPercent: 60,
      prayersCompleted: 28,
      prayersExpected: 35,
      previousPrayersCompleted: 21,
      workouts: 4,
      previousWorkouts: 2,
      spent: 185000,
      previousSpent: 150000,
      topCategoryId: "food",
      topCategoryName: "Food",
      topCategoryAmount: 90000,
      bestProductivityDay: "2026-08-26",
      bestProductivityScore: 91,
      weekdayLabel: "Wednesday",
    });
    expect(review.observations).toEqual([
      "Habits: 80% this week, 60% last week.",
      "Prayers: 28 of 35 logged (21 last week).",
      "Workouts: 4 this week, 2 last week.",
      "Spent TZS 185,000. Top category: Food (TZS 90,000).",
      "You spent 23% more than last week.",
      "Best productivity day: Wednesday (score 91).",
    ]);
  });
});

describe("weeklyReview", () => {
  it("builds observations from numeric diffs without fluff", () => {
    const review = weeklyReview({
      weekStart: "2026-08-24",
      weekEnd: "2026-08-30",
      diffs: [
        { label: "study minutes", previous: 100, current: 142 },
        { label: "workouts", previous: 0, current: 2 },
      ],
    });
    expect(review.copy).toContain("You logged 42% more study minutes than last week.");
    expect(review.copy).not.toMatch(/great|proud|amazing|keep it up/i);
    expect(review.diffs).toHaveLength(2);
  });

  it("omits a diff when both sides are zero", () => {
    const review = weeklyReview({
      weekStart: "2026-08-24",
      weekEnd: "2026-08-30",
      diffs: [{ label: "workouts", previous: 0, current: 0 }],
    });
    expect(review.copy).toBe("");
    expect(review.observations).toEqual([]);
  });
});
