import type { ActivityEvent } from "@/core/types/activity";
import type { ActivityRepository } from "@/repositories/contracts";
import { createMemoryStore } from "@/repositories/memory/store";

export function createMemoryActivityRepository(
  seed: ActivityEvent[] = [],
): ActivityRepository {
  const store = createMemoryStore<ActivityEvent>();
  for (const event of seed) {
    store.upsert(event);
  }

  return {
    async upsert(event) {
      return store.upsert(event);
    },
    async listByDate(userId, localDate) {
      return store
        .list(userId)
        .filter((event) => event.localDate === localDate)
        .sort((a, b) => b.occurredAt - a.occurredAt);
    },
  };
}
