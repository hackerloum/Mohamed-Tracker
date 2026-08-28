import { formatLocalDate } from "@/core/dates/localDate";
import { goalProgressPercent } from "@/core/goals/progress";
import { createGoalInputSchema } from "@/core/schemas/goal";
import type { Goal, GoalMilestone, GoalStatus } from "@/core/types/goal";
import type { ActivityRepository, GoalRepository } from "@/repositories/contracts";
import { emitActivity } from "@/services/inner-activity";

export class GoalNotFoundError extends Error {
  readonly name = "GoalNotFoundError";
  constructor(id: string) {
    super(`Goal not found: ${id}`);
  }
}

export interface CreateGoalInput {
  userId: string;
  timezone: string;
  title: string;
  description?: string;
  type: Goal["type"];
  target: number;
  current?: number;
  unit?: string;
  deadline?: string;
  status?: GoalStatus;
  milestones?: GoalMilestone[];
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string | null;
  status?: GoalStatus;
  milestones?: GoalMilestone[];
}

export interface GoalServiceDeps {
  goals: GoalRepository;
  activities: ActivityRepository;
  now?: () => number;
  createId?: () => string;
  localDateFor?: (at: number, timeZone: string) => string;
}

function touchMilestones(
  milestones: GoalMilestone[],
  current: number,
  now: number,
): GoalMilestone[] {
  return milestones.map((milestone) => {
    if (milestone.reachedAt !== undefined) {
      return milestone;
    }
    if (current >= milestone.targetValue) {
      return { ...milestone, reachedAt: now };
    }
    return milestone;
  });
}

function finalize(goal: Goal, now: number): Goal {
  const progressPercent = goalProgressPercent(goal);
  const milestones = touchMilestones(goal.milestones, goal.current, now);
  const status: GoalStatus =
    progressPercent >= 100 && goal.status === "active"
      ? "completed"
      : goal.status;

  return {
    ...goal,
    milestones,
    progressPercent,
    status,
    updatedAt: now,
  };
}

export function createGoalService(deps: GoalServiceDeps) {
  const now = deps.now ?? Date.now;
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const localDateFor =
    deps.localDateFor ??
    ((at: number, timeZone: string) => formatLocalDate(new Date(at), timeZone));

  async function persist(goal: Goal, title: string): Promise<Goal> {
    const saved = await deps.goals.upsert(goal);
    await emitActivity(deps.activities, {
      userId: saved.userId,
      type: "goal",
      localDate: localDateFor(saved.updatedAt, saved.timezone),
      timezone: saved.timezone,
      title,
      sourceId: saved.id,
      sourceCollection: "goals",
      occurredAt: saved.updatedAt,
    });
    return saved;
  }

  async function update(
    userId: string,
    id: string,
    patch: UpdateGoalInput,
  ): Promise<Goal> {
    const existing = await deps.goals.get(userId, id);
    if (!existing) {
      throw new GoalNotFoundError(id);
    }

    const timestamp = now();
    const next: Goal = {
      ...existing,
      title: patch.title?.trim() ?? existing.title,
      description: patch.description ?? existing.description,
      target: patch.target ?? existing.target,
      current: patch.current ?? existing.current,
      status: patch.status ?? existing.status,
      milestones: patch.milestones ?? existing.milestones,
    };

    if (patch.unit !== undefined) {
      if (patch.unit) {
        next.unit = patch.unit;
      } else {
        delete next.unit;
      }
    }

    if (patch.deadline === null) {
      delete next.deadline;
    } else if (patch.deadline !== undefined) {
      next.deadline = patch.deadline;
    }

    return persist(finalize(next, timestamp), next.title);
  }

  return {
    async list(userId: string): Promise<Goal[]> {
      const rows = await deps.goals.list(userId);
      return rows.map((goal) => ({
        ...goal,
        progressPercent: goalProgressPercent(goal),
      }));
    },

    async get(userId: string, id: string): Promise<Goal | null> {
      const goal = await deps.goals.get(userId, id);
      if (!goal) {
        return null;
      }
      return { ...goal, progressPercent: goalProgressPercent(goal) };
    },

    async create(input: CreateGoalInput): Promise<Goal> {
      const parsed = createGoalInputSchema.parse(input);
      const timestamp = now();
      const draft: Goal = {
        id: createId(),
        userId: parsed.userId,
        title: parsed.title.trim(),
        description: parsed.description?.trim() ?? "",
        type: parsed.type,
        target: parsed.target,
        current: parsed.current ?? 0,
        status: parsed.status ?? "active",
        milestones: parsed.milestones ?? [],
        progressPercent: 0,
        timezone: parsed.timezone,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      if (parsed.unit) {
        draft.unit = parsed.unit;
      }
      if (parsed.deadline) {
        draft.deadline = parsed.deadline;
      }

      return persist(finalize(draft, timestamp), draft.title);
    },

    update,

    async setProgress(
      userId: string,
      id: string,
      current: number,
    ): Promise<Goal> {
      return update(userId, id, { current });
    },

    async remove(userId: string, id: string): Promise<void> {
      await deps.goals.delete(userId, id);
    },
  };
}

export type GoalService = ReturnType<typeof createGoalService>;
