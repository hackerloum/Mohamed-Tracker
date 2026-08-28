import type { NotificationPrefs, UserProfile } from "@/core/types";
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_QUIET_HOURS,
  DEFAULT_SCORE_WEIGHTS,
} from "@/core/types/user";
import { DEFAULT_TIMEZONE } from "@/core/dates";
import { nowIso } from "@/core/dates/localDate";
import { usersRepository } from "@/repositories/users";

export function defaultProfile(input: {
  userId: string;
  displayName: string;
  email: string;
  photoUrl: string | null;
}): UserProfile {
  const stamp = nowIso();
  return {
    id: input.userId,
    userId: input.userId,
    createdAt: stamp,
    updatedAt: stamp,
    displayName: input.displayName,
    email: input.email,
    photoUrl: input.photoUrl,
    timezone: DEFAULT_TIMEZONE,
    currency: "TZS",
    theme: "system",
    accent: "#C4A574",
    scoreWeights: DEFAULT_SCORE_WEIGHTS,
    prayerExtras: false,
    prayer: { extrasEnabled: false },
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
    quietHours: DEFAULT_QUIET_HOURS,
    onboardingComplete: false,
    onboardingCompletedAt: null,
  };
}

export async function ensureProfile(input: {
  userId: string;
  displayName: string;
  email: string;
  photoUrl: string | null;
}): Promise<UserProfile> {
  const existing = await usersRepository.get(input.userId);
  if (existing) return existing;
  const created = defaultProfile(input);
  await usersRepository.upsert(created);
  return created;
}

export async function updateProfile(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<void> {
  const existing = await usersRepository.get(userId);
  if (!existing) return;
  await usersRepository.upsert({
    ...existing,
    ...patch,
    id: existing.id,
    userId: existing.userId,
    updatedAt: nowIso(),
  });
}

export async function updateNotificationPrefs(
  userId: string,
  prefs: NotificationPrefs,
): Promise<void> {
  await updateProfile(userId, { notificationPrefs: prefs });
}
