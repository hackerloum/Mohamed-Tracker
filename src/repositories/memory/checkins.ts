import type { CheckIn } from "@/core/types/checkin";
import type { CheckInRepository } from "@/repositories/contracts";
import { createMemoryStore } from "@/repositories/memory/store";

export function createMemoryCheckInRepository(
  seed: CheckIn[] = [],
): CheckInRepository {
  const store = createMemoryStore<CheckIn>();
  for (const checkIn of seed) {
    store.upsert(checkIn);
  }

  return {
    async upsert(checkIn) {
      return store.upsert(checkIn);
    },
    async getByDate(userId, localDate) {
      return store.get(userId, localDate);
    },
    async listInRange(userId, start, end) {
      return store
        .list(userId)
        .filter((checkIn) => checkIn.localDate >= start && checkIn.localDate <= end)
        .sort((a, b) => a.localDate.localeCompare(b.localDate));
    },
  };
}
