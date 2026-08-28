import { z } from "zod";
import { scale1to5Schema } from "@/core/schemas/sleep";

export const checkInSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  mood: scale1to5Schema.optional(),
  energy: scale1to5Schema.optional(),
  focus: scale1to5Schema.optional(),
  stress: scale1to5Schema.optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const saveCheckInInputSchema = z.object({
  userId: z.string().min(1),
  timezone: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mood: scale1to5Schema.optional(),
  energy: scale1to5Schema.optional(),
  focus: scale1to5Schema.optional(),
  stress: scale1to5Schema.optional(),
});
