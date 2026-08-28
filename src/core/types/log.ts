export const MANUAL_LOG_KINDS = [
  "expense",
  "income",
  "study",
  "workout",
  "prayer",
  "task",
  "habit",
  "note",
  "mood",
  "activity",
  "custom",
] as const;

export type ManualLogKind = (typeof MANUAL_LOG_KINDS)[number];

export const MANUAL_LOG_LABELS: Record<ManualLogKind, string> = {
  expense: "Expense",
  income: "Income",
  study: "Study",
  workout: "Workout",
  prayer: "Prayer",
  task: "Task",
  habit: "Habit",
  note: "Note",
  mood: "Mood",
  activity: "Activity",
  custom: "Custom",
};
