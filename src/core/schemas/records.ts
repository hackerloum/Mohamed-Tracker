import { z } from "zod";
import { baseRecordSchema, datedRecordSchema, isoTimestampSchema, tzsAmountSchema } from "./common";

export const habitSchema = baseRecordSchema.extend({
  name: z.string().min(1),
  icon: z.string(),
  sortOrder: z.number().int(),
  archived: z.boolean(),
  frequency: z.enum(["daily", "weekly"]),
  reminderTime: z.string().nullable(),
});

export const habitEntrySchema = datedRecordSchema.extend({
  habitId: z.string().min(1),
  completed: z.boolean(),
  completedAt: isoTimestampSchema.nullable(),
});

export const dayDocSchema = datedRecordSchema.extend({
  planned: z.boolean(),
  cachedScore: z.number().nullable(),
  stageNotes: z.record(z.string(), z.string()),
});

export const taskSchema = datedRecordSchema.extend({
  title: z.string().min(1),
  notes: z.string(),
  status: z.enum(["open", "done", "cancelled"]),
  sortOrder: z.number().int(),
  dueLocalDate: z.string().nullable(),
});

export const activitySchema = datedRecordSchema.extend({
  type: z.enum([
    "habit",
    "prayer",
    "expense",
    "income",
    "study",
    "workout",
    "task",
    "note",
    "mood",
    "sleep",
    "custom",
    "goal",
    "reflection",
    "activity",
    "checkin",
  ]),
  title: z.string(),
  summary: z.string(),
  sourceId: z.string(),
  sourceCollection: z.string(),
  occurredAt: isoTimestampSchema,
});

export const noteSchema = datedRecordSchema.extend({
  body: z.string(),
});

export const transactionSchema = datedRecordSchema.extend({
  kind: z.enum(["expense", "income"]),
  amount: tzsAmountSchema,
  categoryId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  note: z.string(),
  occurredAt: isoTimestampSchema,
});

export const categorySchema = baseRecordSchema.extend({
  name: z.string().min(1),
  kind: z.enum(["expense", "income", "both"]),
  sortOrder: z.number().int(),
  archived: z.boolean(),
});

export const paymentMethodSchema = baseRecordSchema.extend({
  name: z.string().min(1),
  sortOrder: z.number().int(),
  archived: z.boolean(),
});

export const budgetSchema = baseRecordSchema.extend({
  categoryId: z.string().min(1),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  amount: tzsAmountSchema,
  timezone: z.string().min(1),
});
