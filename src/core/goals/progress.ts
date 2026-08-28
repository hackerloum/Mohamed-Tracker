import type { Goal, GoalType } from "@/core/types/goal";

export interface GoalProgressInput {
  type: GoalType;
  target: number;
  current: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function goalProgressPercent(goal: GoalProgressInput): number {
  const current = Math.max(0, goal.current);

  if (goal.type === "manual") {
    return clamp(Math.round(current), 0, 100);
  }

  if (goal.target <= 0) {
    return 0;
  }

  return clamp(Math.round((current / goal.target) * 100), 0, 100);
}

export function withGoalProgress<T extends GoalProgressInput>(goal: T): T & {
  progressPercent: number;
} {
  return { ...goal, progressPercent: goalProgressPercent(goal) };
}

export function isGoalComplete(goal: Goal): boolean {
  return goalProgressPercent(goal) >= 100;
}
