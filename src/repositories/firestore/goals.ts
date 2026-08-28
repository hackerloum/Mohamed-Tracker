import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type { Goal, GoalMilestone, GoalStatus, GoalType } from "@/core/types/goal";
import { GOAL_STATUSES, GOAL_TYPES } from "@/core/types/goal";
import { goalProgressPercent } from "@/core/goals/progress";
import type { GoalRepository } from "@/repositories/contracts";
import {
  asMillis,
  asNumber,
  asOptionalString,
  asString,
} from "@/repositories/firestore/codec";

function isGoalType(value: string): value is GoalType {
  return (GOAL_TYPES as readonly string[]).includes(value);
}

function isGoalStatus(value: string): value is GoalStatus {
  return (GOAL_STATUSES as readonly string[]).includes(value);
}

function parseMilestones(value: unknown): GoalMilestone[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const milestones: GoalMilestone[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const id = asString(record.id);
    const title = asString(record.title);
    if (!id || !title) {
      continue;
    }
    const milestone: GoalMilestone = {
      id,
      title,
      targetValue: asNumber(record.targetValue),
    };
    const reachedAt = asMillis(record.reachedAt);
    if (reachedAt > 0) {
      milestone.reachedAt = reachedAt;
    }
    milestones.push(milestone);
  }
  return milestones;
}

function fromDoc(id: string, data: Record<string, unknown>): Goal | null {
  const typeRaw = asString(data.type);
  const statusRaw = asString(data.status);
  if (!isGoalType(typeRaw) || !isGoalStatus(statusRaw)) {
    return null;
  }

  const goal: Goal = {
    id,
    userId: asString(data.userId),
    title: asString(data.title),
    description: asString(data.description),
    type: typeRaw,
    target: asNumber(data.target),
    current: asNumber(data.current),
    status: statusRaw,
    milestones: parseMilestones(data.milestones),
    progressPercent: 0,
    timezone: asString(data.timezone, "Africa/Dar_es_Salaam"),
    createdAt: asMillis(data.createdAt),
    updatedAt: asMillis(data.updatedAt),
  };

  const unit = asOptionalString(data.unit);
  if (unit) {
    goal.unit = unit;
  }
  const deadline = asOptionalString(data.deadline);
  if (deadline) {
    goal.deadline = deadline;
  }
  goal.progressPercent = goalProgressPercent(goal);
  return goal;
}

function toDoc(goal: Goal): Record<string, unknown> {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    type: goal.type,
    target: goal.target,
    current: goal.current,
    unit: goal.unit ?? null,
    deadline: goal.deadline ?? null,
    status: goal.status,
    milestones: goal.milestones.map((milestone) => {
      const row: Record<string, unknown> = {
        id: milestone.id,
        title: milestone.title,
        targetValue: milestone.targetValue,
      };
      if (milestone.reachedAt !== undefined) {
        row.reachedAt = milestone.reachedAt;
      }
      return row;
    }),
    progressPercent: goal.progressPercent,
    timezone: goal.timezone,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

export function createFirestoreGoalRepository(db: Firestore): GoalRepository {
  const col = (userId: string) => collection(db, "users", userId, "goals");

  return {
    async list(userId) {
      const snapshot = await getDocs(query(col(userId), orderBy("updatedAt", "desc")));
      const goals: Goal[] = [];
      for (const document of snapshot.docs) {
        const parsed = fromDoc(document.id, document.data());
        if (parsed) {
          goals.push(parsed);
        }
      }
      return goals;
    },
    async get(userId, id) {
      const snapshot = await getDoc(doc(col(userId), id));
      if (!snapshot.exists()) {
        return null;
      }
      return fromDoc(snapshot.id, snapshot.data());
    },
    async upsert(goal) {
      await setDoc(doc(col(goal.userId), goal.id), toDoc(goal));
      return goal;
    },
    async delete(userId, id) {
      await deleteDoc(doc(col(userId), id));
    },
  };
}
