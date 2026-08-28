import type { IsoTimestamp, OwnedRecord, LocalDate } from "./common";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerStatus = "unlogged" | "on_time" | "late" | "missed";

export const PRAYER_ORDER: readonly PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export const CANONICAL_PRAYERS = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

export type CanonicalPrayerKey = (typeof CANONICAL_PRAYERS)[number];

export const EXTRA_PRAYERS = ["tahajjud", "duha", "witr"] as const;

export type ExtraPrayerKey = (typeof EXTRA_PRAYERS)[number];

export type PrayerKey = CanonicalPrayerKey | ExtraPrayerKey;

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  tahajjud: "Tahajjud",
  duha: "Duha",
  witr: "Witr",
};

export interface PrayerEntry extends OwnedRecord {
  prayerKey: PrayerKey;
  prayer: PrayerKey;
  localDate: LocalDate;
  timezone: string;
  completed: boolean;
  status: PrayerStatus;
  note: string | null;
  loggedAt: IsoTimestamp | null;
}

export type { Workout, WorkoutType, WorkoutSet } from "./workout";
export { WORKOUT_TYPES, WORKOUT_TYPE_LABELS } from "./workout";
