export const GOAL_TYPES = [
  "amount",
  "count",
  "duration",
  "percentage",
  "manual",
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];

export const GOAL_STATUSES = [
  "active",
  "paused",
  "completed",
  "abandoned",
] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  reachedAt?: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  target: number;
  current: number;
  unit?: string;
  deadline?: string;
  status: GoalStatus;
  milestones: GoalMilestone[];
  progressPercent: number;
  timezone: string;
  createdAt: number;
  updatedAt: number;
}
