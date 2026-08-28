import type { DayRecord, Habit, HabitEntry } from "@/core/types";
import { nowIso } from "@/lib/firebase/timestamps";
import { writeDay } from "@/repositories/days";
import { completeHabitTap } from "./habitService";

export async function saveDailyPlan(input: {
  userId: string;
  localDate: string;
  timezone: string;
  existing: DayRecord | null;
  priorityTaskIds: string[];
  planHabit: Habit | null;
  planEntry: HabitEntry | null;
}): Promise<DayRecord> {
  const timestamp = nowIso();
  const day: DayRecord = {
    id: input.localDate,
    userId: input.userId,
    localDate: input.localDate,
    timezone: input.timezone,
    planned: true,
    priorityTaskIds: input.priorityTaskIds.slice(0, 3),
    cachedScore: input.existing?.cachedScore ?? null,
    notes: input.existing?.notes ?? null,
    stageNotes: input.existing?.stageNotes ?? {},
    createdAt: input.existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await writeDay(day);

  if (input.planHabit && !input.planEntry?.completed) {
    await completeHabitTap({
      habit: input.planHabit,
      existing: input.planEntry,
      localDate: input.localDate,
      timezone: input.timezone,
    });
  }

  return day;
}

export async function cacheDayScore(input: {
  userId: string;
  localDate: string;
  timezone: string;
  existing: DayRecord | null;
  score: number | null;
}): Promise<void> {
  if (!input.existing) return;
  if (input.existing.cachedScore === input.score) return;
  await writeDay({
    ...input.existing,
    cachedScore: input.score,
  });
}
