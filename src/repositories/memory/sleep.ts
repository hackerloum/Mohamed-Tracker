import type { SleepEntry } from "@/core/types/sleep";
import type { SleepRepository } from "@/repositories/contracts";
import { createMemoryStore } from "@/repositories/memory/store";

export function createMemorySleepRepository(
  seed: SleepEntry[] = [],
): SleepRepository {
  const store = createMemoryStore<SleepEntry>();
  for (const entry of seed) {
    store.upsert(entry);
  }

  return {
    async upsert(entry) {
      return store.upsert(entry);
    },
    async get(userId, id) {
      return store.get(userId, id);
    },
    async findByDate(userId, localDate) {
      return (
        store
          .list(userId)
          .find((entry) => entry.localDate === localDate) ?? null
      );
    },
    async listInRange(userId, start, end) {
      return store
        .list(userId)
        .filter((entry) => entry.localDate >= start && entry.localDate <= end)
        .sort((a, b) => a.localDate.localeCompare(b.localDate));
    },
  };
}
