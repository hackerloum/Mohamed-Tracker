import type { BaseRecord, ClockTime, DatedRecord } from "./common";

export type HabitFrequency = "daily" | "weekly";
export type HabitTargetCount = 1 | 2 | 3;

export interface Habit extends BaseRecord {
  name: string;
  icon: string;
  sortOrder: number;
  archived: boolean;
  frequency: HabitFrequency;
  reminderTime: ClockTime | null;
  targetCount: HabitTargetCount;
}

export interface HabitEntry extends DatedRecord {
  habitId: string;
  count: number;
  completed: boolean;
  completedAt: string | null;
}
