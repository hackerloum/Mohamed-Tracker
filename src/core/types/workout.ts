import type { LocalDate, OwnedRecord } from "./common";

export const WORKOUT_TYPES = [
  "gym",
  "running",
  "walking",
  "cycling",
  "home",
  "football",
  "other",
] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  gym: "Gym",
  running: "Running",
  walking: "Walking",
  cycling: "Cycling",
  home: "Home",
  football: "Football",
  other: "Other",
};

export interface WorkoutSet {
  exercise: string;
  reps: number | null;
  weightKg: number | null;
}

export interface Workout extends OwnedRecord {
  localDate: LocalDate;
  timezone: string;
  type: WorkoutType;
  durationMinutes: number;
  notes: string | null;
  sets: WorkoutSet[];
}
