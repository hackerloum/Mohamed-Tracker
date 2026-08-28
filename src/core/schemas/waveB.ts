import { z } from "zod";

export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);

export const habitTargetSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const createHabitSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetCount: habitTargetSchema.default(1),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  priority: z.boolean().default(false),
});

export const createNoteSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const prayerKeySchema = z.enum([
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "tahajjud",
  "duha",
  "witr",
]);
