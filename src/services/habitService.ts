import { applyHabitTap } from "@/core/engines/habitCompletion";
import type { Habit, HabitEntry, HabitTargetCount } from "@/core/types";
import { nowIso } from "@/lib/firebase/timestamps";
import { archiveHabit, writeHabit } from "@/repositories/habits";
import { newDocumentId } from "@/repositories/ids";
import { writeHabitEntry } from "@/repositories/habitEntries";
import { habitEntryId } from "@/repositories/paths";
import { emitActivity } from "./activityService";

export function nextHabitEntry(
  habit: Habit,
  existing: HabitEntry | null,
  localDate: string,
  timezone: string,
): HabitEntry {
  const tapped = applyHabitTap(existing?.count ?? null, habit.targetCount);
  const timestamp = nowIso();
  return {
    id: existing?.id ?? habitEntryId(habit.id, localDate),
    userId: habit.userId,
    habitId: habit.id,
    localDate,
    timezone,
    count: tapped.count,
    completed: tapped.completed,
    completedAt: tapped.completed ? timestamp : existing?.completedAt ?? null,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export async function completeHabitTap(input: {
  habit: Habit;
  existing: HabitEntry | null;
  localDate: string;
  timezone: string;
}): Promise<HabitEntry> {
  const entry = nextHabitEntry(
    input.habit,
    input.existing,
    input.localDate,
    input.timezone,
  );
  await writeHabitEntry(entry);
  await emitActivity({
    userId: input.habit.userId,
    type: "habit",
    localDate: input.localDate,
    timezone: input.timezone,
    title: input.habit.name,
    relatedId: input.habit.id,
  });
  return entry;
}

export async function createHabit(input: {
  userId: string;
  name: string;
  targetCount: HabitTargetCount;
  sortOrder: number;
}): Promise<Habit> {
  const timestamp = nowIso();
  const habit: Habit = {
    id: newDocumentId(input.userId, "habits"),
    userId: input.userId,
    name: input.name,
    icon: "",
    frequency: "daily",
    reminderTime: null,
    targetCount: input.targetCount,
    sortOrder: input.sortOrder,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeHabit(habit);
  return habit;
}

export async function updateHabit(habit: Habit): Promise<void> {
  await writeHabit({ ...habit, updatedAt: nowIso() });
}

export async function removeHabit(userId: string, habitId: string): Promise<void> {
  await archiveHabit(userId, habitId);
}
