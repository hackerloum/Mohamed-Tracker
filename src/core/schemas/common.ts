import { z } from "zod";

export const isoTimestampSchema = z.string().min(1);
export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
export const clockTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Expected HH:mm");
export const tzsAmountSchema = z.number().int();

export const baseRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const datedRecordSchema = baseRecordSchema.extend({
  localDate: localDateSchema,
  timezone: z.string().min(1),
});
