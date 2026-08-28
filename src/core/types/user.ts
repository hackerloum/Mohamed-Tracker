import type { BaseRecord, ClockTime, IanaTimezone, IsoTimestamp } from "./common";

export type ThemeMode = "system" | "light" | "dark";
export type ThemePreference = ThemeMode;

export interface ScoreWeights {
  habits: number;
  prayer: number;
  plan: number;
  tasks: number;
  study: number;
  workout: number;
  reflection: number;
}

export interface QuietHours {
  start: ClockTime;
  end: ClockTime;
}

export interface PrayerPrefs {
  extrasEnabled: boolean;
}

export interface NotificationPrefs {
  morningBriefing: boolean;
  eveningReview: boolean;
  weeklyReview: boolean;
  habitReminders: boolean;
  prayerReminders: boolean;
  budgetAlerts: boolean;
  goalAlerts: boolean;
  quietHours: QuietHours;
}

export interface UserProfile extends BaseRecord {
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  timezone: IanaTimezone;
  currency: "TZS";
  theme: ThemeMode;
  accent: string;
  scoreWeights: ScoreWeights;
  prayerExtras: boolean;
  prayer: PrayerPrefs;
  notificationPrefs: NotificationPrefs;
  quietHours: QuietHours;
  onboardingComplete: boolean;
  onboardingCompletedAt: IsoTimestamp | null;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  habits: 40,
  prayer: 30,
  plan: 15,
  tasks: 15,
  study: 0,
  workout: 0,
  reflection: 0,
};

export const DEFAULT_QUIET_HOURS: QuietHours = {
  start: "23:00",
  end: "06:00",
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  morningBriefing: true,
  eveningReview: true,
  weeklyReview: true,
  habitReminders: true,
  prayerReminders: true,
  budgetAlerts: true,
  goalAlerts: true,
  quietHours: DEFAULT_QUIET_HOURS,
};
