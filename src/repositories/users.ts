import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import type { NotificationPrefs, ScoreWeights, ThemePreference, UserProfile } from "@/core/types";
import {
  DEFAULT_ACCENT,
  DEFAULT_QUIET_HOURS,
  DEFAULT_SCORE_WEIGHTS,
  DEFAULT_TIMEZONE,
} from "@/core/defaults/onboarding";
import { DEFAULT_NOTIFICATION_PREFS } from "@/core/types/user";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import {
  asRecord,
  readBoolean,
  readIso,
  readNumber,
  readString,
  readStringOrNull,
} from "./parse";
import { userDocPath } from "./paths";

function parseWeights(value: unknown): ScoreWeights {
  if (typeof value !== "object" || value === null) return DEFAULT_SCORE_WEIGHTS;
  const record = value as Record<string, unknown>;
  return {
    habits: readNumber(record, "habits", DEFAULT_SCORE_WEIGHTS.habits),
    prayer: readNumber(record, "prayer", DEFAULT_SCORE_WEIGHTS.prayer),
    plan: readNumber(record, "plan", DEFAULT_SCORE_WEIGHTS.plan),
    tasks: readNumber(record, "tasks", DEFAULT_SCORE_WEIGHTS.tasks),
    study: readNumber(record, "study", DEFAULT_SCORE_WEIGHTS.study),
    workout: readNumber(record, "workout", DEFAULT_SCORE_WEIGHTS.workout),
    reflection: readNumber(record, "reflection", DEFAULT_SCORE_WEIGHTS.reflection),
  };
}

function parseNotificationPrefs(value: unknown): NotificationPrefs {
  if (typeof value !== "object" || value === null) return DEFAULT_NOTIFICATION_PREFS;
  const record = value as Record<string, unknown>;
  const quiet = record.quietHours;
  const quietRecord =
    typeof quiet === "object" && quiet !== null ? (quiet as Record<string, unknown>) : {};
  return {
    morningBriefing: readBoolean(record, "morningBriefing", DEFAULT_NOTIFICATION_PREFS.morningBriefing),
    eveningReview: readBoolean(record, "eveningReview", DEFAULT_NOTIFICATION_PREFS.eveningReview),
    weeklyReview: readBoolean(record, "weeklyReview", DEFAULT_NOTIFICATION_PREFS.weeklyReview),
    habitReminders: readBoolean(record, "habitReminders", DEFAULT_NOTIFICATION_PREFS.habitReminders),
    prayerReminders: readBoolean(record, "prayerReminders", DEFAULT_NOTIFICATION_PREFS.prayerReminders),
    budgetAlerts: readBoolean(record, "budgetAlerts", DEFAULT_NOTIFICATION_PREFS.budgetAlerts),
    goalAlerts: readBoolean(record, "goalAlerts", DEFAULT_NOTIFICATION_PREFS.goalAlerts),
    quietHours: {
      start: readString(quietRecord, "start", DEFAULT_QUIET_HOURS.start),
      end: readString(quietRecord, "end", DEFAULT_QUIET_HOURS.end),
    },
  };
}

function parseTheme(value: unknown): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "dark";
}

function parseProfile(id: string, data: Record<string, unknown>): UserProfile {
  const quiet = data.quietHours;
  const quietRecord =
    typeof quiet === "object" && quiet !== null
      ? (quiet as Record<string, unknown>)
      : {};
  const prayer = data.prayer;
  const prayerRecord =
    typeof prayer === "object" && prayer !== null
      ? (prayer as Record<string, unknown>)
      : {};

  return {
    id,
    userId: readString(data, "userId", id),
    displayName: readStringOrNull(data, "displayName"),
    email: readStringOrNull(data, "email"),
    photoUrl: readStringOrNull(data, "photoUrl"),
    timezone: readString(data, "timezone", DEFAULT_TIMEZONE),
    currency: "TZS",
    theme: parseTheme(data.theme),
    accent: readString(data, "accent", DEFAULT_ACCENT),
    scoreWeights: parseWeights(data.scoreWeights),
    prayerExtras: readBoolean(data, "prayerExtras") || readBoolean(prayerRecord, "extrasEnabled"),
    prayer: { extrasEnabled: readBoolean(prayerRecord, "extrasEnabled") || readBoolean(data, "prayerExtras") },
    notificationPrefs: parseNotificationPrefs(data.notificationPrefs),
    quietHours: {
      start: readString(quietRecord, "start", DEFAULT_QUIET_HOURS.start),
      end: readString(quietRecord, "end", DEFAULT_QUIET_HOURS.end),
    },
    onboardingComplete: readBoolean(data, "onboardingComplete") || Boolean(readStringOrNull(data, "onboardingCompletedAt")),
    onboardingCompletedAt: readStringOrNull(data, "onboardingCompletedAt"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function profileRef(userId: string) {
  return doc(requireDb(), userDocPath(userId));
}

export function subscribeProfile(
  userId: string,
  onChange: (profile: UserProfile | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    profileRef(userId),
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange(parseProfile(snap.id, asRecord(snap.data())));
    },
    (error) => onError(error),
  );
}

export async function writeProfile(profile: UserProfile): Promise<void> {
  await setDoc(profileRef(profile.userId), {
    userId: profile.userId,
    displayName: profile.displayName,
    email: profile.email,
    photoUrl: profile.photoUrl,
    timezone: profile.timezone,
    currency: profile.currency,
    theme: profile.theme,
    accent: profile.accent,
    scoreWeights: profile.scoreWeights,
    prayerExtras: profile.prayerExtras,
    prayer: profile.prayer,
    notificationPrefs: profile.notificationPrefs,
    quietHours: profile.quietHours,
    onboardingComplete: profile.onboardingComplete,
    onboardingCompletedAt: profile.onboardingCompletedAt,
    createdAt: profile.createdAt,
    updatedAt: nowIso(),
  });
}

export const usersRepository = {
  async get(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(profileRef(userId));
    if (!snap.exists()) return null;
    return parseProfile(snap.id, asRecord(snap.data()));
  },
  upsert(profile: UserProfile): Promise<void> {
    return writeProfile(profile);
  },
};
