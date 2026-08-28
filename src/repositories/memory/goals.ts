import type { Goal } from "@/core/types/goal";
import type { GoalRepository } from "@/repositories/contracts";
import { createMemoryStore } from "@/repositories/memory/store";

export function createMemoryGoalRepository(seed: Goal[] = []): GoalRepository {
  const store = createMemoryStore<Goal>();
  for (const goal of seed) {
    store.upsert(goal);
  }

  return {
    async list(userId) {
      return store
        .list(userId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async get(userId, id) {
      return store.get(userId, id);
    },
    async upsert(goal) {
      return store.upsert(goal);
    },
    async delete(userId, id) {
      store.delete(userId, id);
    },
  };
}
