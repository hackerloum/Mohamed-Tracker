import { getClientFirestore, isFirebaseConfigured } from "@/lib/firebase/client";
import { createFirestoreActivityRepository } from "@/repositories/firestore/activities";
import { createFirestoreCheckInRepository } from "@/repositories/firestore/checkins";
import { createFirestoreGoalRepository } from "@/repositories/firestore/goals";
import { createFirestoreReflectionRepository } from "@/repositories/firestore/reflections";
import { createFirestoreSleepRepository } from "@/repositories/firestore/sleep";
import { createMemoryActivityRepository } from "@/repositories/memory/activities";
import { createMemoryCheckInRepository } from "@/repositories/memory/checkins";
import { createMemoryGoalRepository } from "@/repositories/memory/goals";
import { createMemoryReflectionRepository } from "@/repositories/memory/reflections";
import { createMemorySleepRepository } from "@/repositories/memory/sleep";
import { createCheckInService } from "@/services/checkins";
import { createGoalService } from "@/services/goals";
import { createReflectionService } from "@/services/reflections";
import { createSleepService } from "@/services/sleep";

export type InnerBackend = "firestore" | "memory";

export interface InnerServices {
  backend: InnerBackend;
  goals: ReturnType<typeof createGoalService>;
  sleep: ReturnType<typeof createSleepService>;
  reflections: ReturnType<typeof createReflectionService>;
  checkins: ReturnType<typeof createCheckInService>;
}

export function resolveInnerBackend(): InnerBackend {
  return isFirebaseConfigured() ? "firestore" : "memory";
}

let memoryServices: InnerServices | null = null;

function createMemoryInnerServices(): InnerServices {
  if (memoryServices) {
    return memoryServices;
  }

  const activities = createMemoryActivityRepository();
  memoryServices = {
    backend: "memory",
    goals: createGoalService({
      goals: createMemoryGoalRepository(),
      activities,
    }),
    sleep: createSleepService({
      sleep: createMemorySleepRepository(),
      activities,
    }),
    reflections: createReflectionService({
      reflections: createMemoryReflectionRepository(),
      activities,
    }),
    checkins: createCheckInService({
      checkins: createMemoryCheckInRepository(),
      activities,
    }),
  };
  return memoryServices;
}

export function createInnerServices(backend: InnerBackend = resolveInnerBackend()): InnerServices {
  if (backend === "firestore") {
    const db = getClientFirestore();
    if (!db) {
      return createMemoryInnerServices();
    }

    const activities = createFirestoreActivityRepository(db);
    return {
      backend: "firestore",
      goals: createGoalService({
        goals: createFirestoreGoalRepository(db),
        activities,
      }),
      sleep: createSleepService({
        sleep: createFirestoreSleepRepository(db),
        activities,
      }),
      reflections: createReflectionService({
        reflections: createFirestoreReflectionRepository(db),
        activities,
      }),
      checkins: createCheckInService({
        checkins: createFirestoreCheckInRepository(db),
        activities,
      }),
    };
  }

  return createMemoryInnerServices();
}
