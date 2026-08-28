import type { ScoreWeights } from "@/core/types";
import { DEFAULT_SCORE_WEIGHTS } from "@/core/defaults/onboarding";

export interface DailyScoreInput {
  habits: Array<{ count: number; targetCount: number }>;
  prayersCompleted: number;
  prayerTotal: number;
  planned: boolean;
  includePlan: boolean;
  tasksCompleted: number;
  tasksTotal: number;
  weights?: ScoreWeights;
}

export interface DailyScoreResult {
  score: number | null;
  breakdown: {
    habits: number | null;
    prayer: number | null;
    plan: number | null;
    tasks: number | null;
  };
}

function ratioScore(completed: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((completed / total) * 100);
}

export function computeDailyScore(input: DailyScoreInput): DailyScoreResult {
  const weights = input.weights ?? DEFAULT_SCORE_WEIGHTS;

  const habits =
    input.habits.length === 0
      ? null
      : Math.round(
          (input.habits.reduce((sum, habit) => {
            const target = Math.max(habit.targetCount, 1);
            return sum + Math.min(habit.count, target) / target;
          }, 0) /
            input.habits.length) *
            100,
        );

  const prayer = ratioScore(input.prayersCompleted, input.prayerTotal);
  const plan = input.includePlan ? (input.planned ? 100 : 0) : null;
  const tasks = ratioScore(input.tasksCompleted, input.tasksTotal);

  let weighted = 0;
  let used = 0;
  if (habits !== null) {
    weighted += habits * weights.habits;
    used += weights.habits;
  }
  if (prayer !== null) {
    weighted += prayer * weights.prayer;
    used += weights.prayer;
  }
  if (plan !== null) {
    weighted += plan * weights.plan;
    used += weights.plan;
  }
  if (tasks !== null) {
    weighted += tasks * weights.tasks;
    used += weights.tasks;
  }

  return {
    score: used === 0 ? null : Math.round(weighted / used),
    breakdown: { habits, prayer, plan, tasks },
  };
}
