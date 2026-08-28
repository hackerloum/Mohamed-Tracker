import { z } from "zod";
import { GOAL_STATUSES, GOAL_TYPES } from "@/core/types/goal";

export const goalTypeSchema = z.enum(GOAL_TYPES);
export const goalStatusSchema = z.enum(GOAL_STATUSES);

export const goalMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  targetValue: z.number().nonnegative(),
  reachedAt: z.number().int().nonnegative().optional(),
});

export const goalSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  type: goalTypeSchema,
  target: z.number().nonnegative(),
  current: z.number(),
  unit: z.string().min(1).optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: goalStatusSchema,
  milestones: z.array(goalMilestoneSchema),
  progressPercent: z.number().min(0).max(100),
  timezone: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const createGoalInputSchema = z.object({
  userId: z.string().min(1),
  timezone: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: goalTypeSchema,
  target: z.number().nonnegative(),
  current: z.number().optional(),
  unit: z.string().min(1).optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: goalStatusSchema.optional(),
  milestones: z.array(goalMilestoneSchema).optional(),
});
