import type { Reflection } from "@/core/types/reflection";
import type { ReflectionRepository } from "@/repositories/contracts";
import { createMemoryStore } from "@/repositories/memory/store";

export function createMemoryReflectionRepository(
  seed: Reflection[] = [],
): ReflectionRepository {
  const store = createMemoryStore<Reflection>();
  for (const reflection of seed) {
    store.upsert(reflection);
  }

  return {
    async upsert(reflection) {
      return store.upsert(reflection);
    },
    async getByDate(userId, localDate) {
      return store.get(userId, localDate);
    },
  };
}
