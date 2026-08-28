import type { ActivityEvent } from "@/core/types/activity";
import type { ActivityRepository } from "@/repositories/contracts";

export async function emitActivity(
  activities: ActivityRepository,
  event: Omit<ActivityEvent, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: number;
    updatedAt?: number;
  },
): Promise<ActivityEvent> {
  const id = event.id ?? `${event.sourceCollection}:${event.sourceId}`;
  const timestamp = event.updatedAt ?? event.occurredAt;
  const stored: ActivityEvent = {
    id,
    userId: event.userId,
    type: event.type,
    localDate: event.localDate,
    timezone: event.timezone,
    title: event.title,
    sourceId: event.sourceId,
    sourceCollection: event.sourceCollection,
    occurredAt: event.occurredAt,
    createdAt: event.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  return activities.upsert(stored);
}
