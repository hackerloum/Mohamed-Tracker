import { PRAYER_LABELS, type CanonicalPrayerKey } from "@/core/types";

export interface NextActionContext {
  nowHour: number;
  planned: boolean;
  prayers: Array<{ key: CanonicalPrayerKey; completed: boolean }>;
  habits: Array<{ id: string; name: string; completed: boolean; sortOrder: number }>;
  tasks: Array<{ id: string; title: string; completed: boolean; priority: boolean }>;
}

export type NextAction =
  | { kind: "plan"; title: string; reason: string }
  | { kind: "prayer"; key: CanonicalPrayerKey; title: string; reason: string }
  | { kind: "habit"; habitId: string; title: string; reason: string }
  | { kind: "task"; taskId: string; title: string; reason: string };

const PRAYER_START: Record<CanonicalPrayerKey, number> = {
  fajr: 5,
  dhuhr: 12,
  asr: 15,
  maghrib: 18,
  isha: 19,
};

export function nextAction(ctx: NextActionContext): NextAction | null {
  if (!ctx.planned && ctx.nowHour < 20) {
    return {
      kind: "plan",
      title: "Plan my day",
      reason: "Set today’s priorities before the evening.",
    };
  }

  const overdue = ctx.prayers.find(
    (prayer) => !prayer.completed && ctx.nowHour >= PRAYER_START[prayer.key],
  );
  if (overdue) {
    return {
      kind: "prayer",
      key: overdue.key,
      title: `Pray ${PRAYER_LABELS[overdue.key]}`,
      reason: "This window has already opened.",
    };
  }

  const priority = ctx.tasks.find((task) => !task.completed && task.priority);
  if (priority) {
    return {
      kind: "task",
      taskId: priority.id,
      title: priority.title,
      reason: "A priority is still open.",
    };
  }

  const habit = [...ctx.habits]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .find((item) => !item.completed);
  if (habit) {
    return {
      kind: "habit",
      habitId: habit.id,
      title: habit.name,
      reason: "Still on today’s list.",
    };
  }

  const openTask = ctx.tasks.find((task) => !task.completed);
  if (openTask) {
    return {
      kind: "task",
      taskId: openTask.id,
      title: openTask.title,
      reason: "A task is still open.",
    };
  }

  const upcoming = ctx.prayers.find((prayer) => !prayer.completed);
  if (upcoming) {
    return {
      kind: "prayer",
      key: upcoming.key,
      title: `Pray ${PRAYER_LABELS[upcoming.key]}`,
      reason: "Next prayer.",
    };
  }

  return null;
}
