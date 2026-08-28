import type { UserProfile } from "@/core/types";
import {
  DEFAULT_ACCENT,
  DEFAULT_HABITS,
  DEFAULT_QUIET_HOURS,
  DEFAULT_SCORE_WEIGHTS,
  DEFAULT_TIMEZONE,
} from "@/core/defaults/onboarding";
import { nowIso } from "@/lib/firebase/timestamps";
import { writeHabit } from "@/repositories/habits";
import { writeProfile } from "@/repositories/users";

export async function completeOnboarding(input: {
  userId: string;
  displayName: string | null;
  email: string | null;
  timezone?: string;
  skip: boolean;
}): Promise<UserProfile> {
  const timestamp = nowIso();
  const profile: UserProfile = {
    id: input.userId,
    userId: input.userId,
    displayName: input.displayName,
    email: input.email,
    photoUrl: null,
    timezone: input.timezone ?? DEFAULT_TIMEZONE,
    currency: "TZS",
    theme: "dark",
    accent: DEFAULT_ACCENT,
    scoreWeights: DEFAULT_SCORE_WEIGHTS,
    prayerExtras: false,
    prayer: { extrasEnabled: false },
    notificationPrefs: {
      morningBriefing: true,
      eveningReview: true,
      weeklyReview: true,
      habitReminders: true,
      prayerReminders: true,
      budgetAlerts: true,
      goalAlerts: true,
      quietHours: DEFAULT_QUIET_HOURS,
    },
    quietHours: DEFAULT_QUIET_HOURS,
    onboardingComplete: true,
    onboardingCompletedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeProfile(profile);

  for (const seed of DEFAULT_HABITS) {
    await writeHabit({
      id: `seed_${seed.name.toLowerCase().replace(/ /g, "_")}`,
      userId: input.userId,
      name: seed.name,
      icon: "",
      frequency: "daily" as const,
      reminderTime: null,
      targetCount: seed.targetCount,
      sortOrder: seed.sortOrder,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  void input.skip;
  return profile;
}
