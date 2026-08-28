import { z } from "zod";
import { REFLECTION_MODES } from "@/core/types/reflection";

export const reflectionModeSchema = z.enum(REFLECTION_MODES);

export const reflectionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  mode: reflectionModeSchema,
  wentWell: z.string().optional(),
  couldBeBetter: z.string().optional(),
  learned: z.string().optional(),
  gratefulFor: z.string().optional(),
  anythingElse: z.string().optional(),
  dayRating: z.number().int().min(1).max(10).optional(),
  mainWin: z.string().optional(),
  improveTomorrow: z.string().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const saveReflectionInputSchema = z.object({
  userId: z.string().min(1),
  timezone: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mode: reflectionModeSchema,
  wentWell: z.string().optional(),
  couldBeBetter: z.string().optional(),
  learned: z.string().optional(),
  gratefulFor: z.string().optional(),
  anythingElse: z.string().optional(),
  dayRating: z.number().int().min(1).max(10).optional(),
  mainWin: z.string().optional(),
  improveTomorrow: z.string().optional(),
});
