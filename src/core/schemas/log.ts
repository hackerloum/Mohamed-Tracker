import { z } from "zod";
import { ACTIVITY_TYPES } from "@/core/types/activity";
import { WORKOUT_TYPES } from "@/core/types/workout";

export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const isoDateTimeSchema = z.string().min(1);

export const studySessionInputSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  subjectId: z.string().min(1).nullable(),
  notes: z.string().trim().max(2000).nullable(),
  startedAt: isoDateTimeSchema,
  endedAt: isoDateTimeSchema,
  timezone: z.string().min(1),
});

export const studySubjectInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const workoutSetSchema = z.object({
  exercise: z.string().trim().min(1).max(80),
  reps: z.number().int().positive().nullable(),
  weightKg: z.number().nonnegative().nullable(),
});

export const workoutInputSchema = z.object({
  type: z.enum(WORKOUT_TYPES),
  durationMinutes: z.number().int().positive().max(24 * 60),
  notes: z.string().trim().max(2000).nullable(),
  sets: z.array(workoutSetSchema).default([]),
  timezone: z.string().min(1),
});

export const manualActivityInputSchema = z.object({
  type: z.enum(["activity", "custom"]),
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).nullable(),
  timezone: z.string().min(1),
});

export const noteInputSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  timezone: z.string().min(1),
});

export const activityTypeSchema = z.enum(ACTIVITY_TYPES);
