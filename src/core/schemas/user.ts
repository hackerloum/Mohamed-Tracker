import { z } from "zod";
import { baseRecordSchema, clockTimeSchema } from "./common";

export const scoreWeightsSchema = z.object({
  habits: z.number(),
  prayer: z.number(),
  study: z.number(),
  workout: z.number(),
  reflection: z.number(),
});

export const quietHoursSchema = z.object({
  start: clockTimeSchema,
  end: clockTimeSchema,
});

export const notificationPrefsSchema = z.object({
  morningBriefing: z.boolean(),
  eveningReview: z.boolean(),
  weeklyReview: z.boolean(),
  habitReminders: z.boolean(),
  prayerReminders: z.boolean(),
  budgetAlerts: z.boolean(),
  goalAlerts: z.boolean(),
  quietHours: quietHoursSchema,
});

export const userProfileSchema = baseRecordSchema.extend({
  displayName: z.string(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  timezone: z.string().min(1),
  currency: z.literal("TZS"),
  theme: z.enum(["system", "light", "dark"]),
  accent: z.string().min(1),
  scoreWeights: scoreWeightsSchema,
  prayerExtras: z.boolean(),
  notificationPrefs: notificationPrefsSchema,
  onboardingComplete: z.boolean(),
});
