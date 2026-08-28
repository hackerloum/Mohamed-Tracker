import { z } from "zod";

export const scale1to5Schema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const sleepEntrySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  bedtime: z.string().min(1),
  wakeTime: z.string().min(1),
  durationMinutes: z.number().int().nonnegative(),
  quality: scale1to5Schema,
  notes: z.string().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const logSleepInputSchema = z.object({
  userId: z.string().min(1),
  timezone: z.string().min(1),
  bedtime: z.string().min(1),
  wakeTime: z.string().min(1),
  quality: scale1to5Schema,
  notes: z.string().optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
