import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import type { ActivityEvent, ActivitySourceCollection, ActivityType } from "@/core/types/activity";
import { ACTIVITY_TYPES } from "@/core/types/activity";
import type { ActivityRepository } from "@/repositories/contracts";
import { asMillis, asString } from "@/repositories/firestore/codec";

const SOURCE_COLLECTIONS = [
  "goals",
  "reflections",
  "sleep",
  "checkins",
] as const;

function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}

function isSource(
  value: string,
): value is ActivitySourceCollection {
  return (SOURCE_COLLECTIONS as readonly string[]).includes(value);
}

function fromDoc(id: string, data: Record<string, unknown>): ActivityEvent | null {
  const typeRaw = asString(data.type);
  const sourceRaw = asString(data.sourceCollection);
  if (!isActivityType(typeRaw) || !isSource(sourceRaw)) {
    return null;
  }

  return {
    id,
    userId: asString(data.userId),
    type: typeRaw,
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    title: asString(data.title),
    sourceId: asString(data.sourceId),
    sourceCollection: sourceRaw,
    occurredAt: asMillis(data.occurredAt),
    createdAt: asMillis(data.createdAt),
    updatedAt: asMillis(data.updatedAt),
  };
}

export function createFirestoreActivityRepository(
  db: Firestore,
): ActivityRepository {
  const col = (userId: string) => collection(db, "users", userId, "activities");

  return {
    async upsert(event) {
      await setDoc(doc(col(event.userId), event.id), { ...event });
      return event;
    },
    async listByDate(userId, localDate) {
      const snapshot = await getDocs(
        query(col(userId), where("localDate", "==", localDate)),
      );
      const events: ActivityEvent[] = [];
      for (const document of snapshot.docs) {
        const parsed = fromDoc(document.id, document.data());
        if (parsed) {
          events.push(parsed);
        }
      }
      return events.sort((a, b) => b.occurredAt - a.occurredAt);
    },
  };
}
