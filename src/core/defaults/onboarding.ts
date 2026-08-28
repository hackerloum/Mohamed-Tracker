import type { HabitTargetCount, ScoreWeights } from "@/core/types";

export const DEFAULT_TIMEZONE = "Africa/Dar_es_Salaam";
export const DEFAULT_CURRENCY = "TZS" as const;
export const DEFAULT_ACCENT = "#C4A574";
export const DEFAULT_QUIET_HOURS = { start: "23:00", end: "06:00" };

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  habits: 40,
  prayer: 30,
  plan: 15,
  tasks: 15,
  study: 0,
  workout: 0,
  reflection: 0,
};

export const DEFAULT_HABITS: ReadonlyArray<{
  name: string;
  targetCount: HabitTargetCount;
  sortOrder: number;
}> = [
  { name: "Plan My Day", targetCount: 1, sortOrder: 0 },
  { name: "Workout", targetCount: 1, sortOrder: 1 },
  { name: "Study", targetCount: 1, sortOrder: 2 },
  { name: "Read", targetCount: 1, sortOrder: 3 },
  { name: "Daily Reflection", targetCount: 1, sortOrder: 4 },
];
