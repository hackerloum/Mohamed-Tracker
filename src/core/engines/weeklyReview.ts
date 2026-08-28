import { formatTzs } from "@/core/money/integer";
import { percentChange } from "./insights";
import type { LocalDate } from "../types/common";

export interface WeeklyReviewDiff {
  label: string;
  previous: number;
  current: number;
}

export interface WeeklyReviewInput {
  weekStart: LocalDate;
  weekEnd: LocalDate;
  diffs: WeeklyReviewDiff[];
}

export interface WeeklyReviewFacts {
  weekStart: LocalDate;
  weekEnd: LocalDate;
  habitPercent: number | null;
  previousHabitPercent: number | null;
  prayersCompleted: number;
  prayersExpected: number;
  previousPrayersCompleted: number;
  studyMinutes: number;
  previousStudyMinutes: number;
  workouts: number;
  previousWorkouts: number;
  spent: number;
  previousSpent: number;
  topCategoryId: string | null;
  topCategoryName: string | null;
  topCategoryAmount: number;
  bestProductivityDay: LocalDate | null;
  bestProductivityScore: number | null;
  weekdayLabel: string | null;
}

export interface WeeklyReview {
  copy: string;
  observations: string[];
  diffs: WeeklyReviewDiff[];
}

function changeLine(label: string, current: number, previous: number): string | null {
  const change = percentChange(current, previous);
  if (change === null) return null;
  const direction = change > 0 ? "more" : "less";
  return `You logged ${Math.abs(change)}% ${direction} ${label} than last week.`;
}

function hoursLabel(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

function studyChangeLine(current: number, previous: number): string | null {
  const change = percentChange(current, previous);
  if (change === null) return null;
  const direction = change > 0 ? "more" : "less";
  return `You studied ${Math.abs(change)}% ${direction} than last week.`;
}

export function weeklyReviewFromFacts(facts: WeeklyReviewFacts): WeeklyReview {
  const observations: string[] = [];

  if (facts.habitPercent !== null) {
    if (facts.previousHabitPercent !== null) {
      observations.push(
        `Habits: ${facts.habitPercent}% this week, ${facts.previousHabitPercent}% last week.`,
      );
    } else {
      observations.push(`Habits: ${facts.habitPercent}% this week.`);
    }
  }

  if (facts.prayersExpected > 0) {
    const previous =
      facts.previousPrayersCompleted > 0 ? ` (${facts.previousPrayersCompleted} last week)` : "";
    observations.push(
      `Prayers: ${facts.prayersCompleted} of ${facts.prayersExpected} logged${previous}.`,
    );
  }

  const studyChange = studyChangeLine(facts.studyMinutes, facts.previousStudyMinutes);
  if (studyChange) {
    observations.push(studyChange);
  } else if (facts.studyMinutes > 0) {
    observations.push(`Study this week: ${hoursLabel(facts.studyMinutes)}.`);
  }

  if (facts.workouts > 0 || facts.previousWorkouts > 0) {
    observations.push(`Workouts: ${facts.workouts} this week, ${facts.previousWorkouts} last week.`);
  }

  if (facts.spent > 0) {
    const top =
      facts.topCategoryName && facts.topCategoryAmount > 0
        ? ` Top category: ${facts.topCategoryName} (${formatTzs(facts.topCategoryAmount, { withCode: true })}).`
        : "";
    observations.push(`Spent ${formatTzs(facts.spent, { withCode: true })}.${top}`);
    const spendChange = percentChange(facts.spent, facts.previousSpent);
    if (spendChange !== null) {
      const direction = spendChange > 0 ? "more" : "less";
      observations.push(`You spent ${Math.abs(spendChange)}% ${direction} than last week.`);
    }
  }

  if (facts.bestProductivityDay && facts.weekdayLabel && facts.bestProductivityScore !== null) {
    observations.push(
      `Best productivity day: ${facts.weekdayLabel} (score ${facts.bestProductivityScore}).`,
    );
  }

  return {
    copy: observations.join(" "),
    observations,
    diffs: [],
  };
}

export function weeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const observations: string[] = [];
  for (const diff of input.diffs) {
    if (diff.current === 0 && diff.previous === 0) continue;
    const change = changeLine(diff.label, diff.current, diff.previous);
    if (change) {
      observations.push(change);
      continue;
    }
    if (diff.current > 0) {
      observations.push(`${diff.label}: ${diff.current} this week.`);
    }
  }
  return {
    copy: observations.join(" "),
    observations,
    diffs: input.diffs,
  };
}
