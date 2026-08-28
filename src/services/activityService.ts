import type { Activity, ActivityType } from "@/core/types";
import { writeActivity } from "@/repositories/activities";
import { nowIso } from "@/lib/firebase/timestamps";

export async function emitActivity(input: {
  userId: string;
  type: ActivityType;
  localDate: string;
  timezone: string;
  title: string;
  relatedId: string;
}): Promise<void> {
  const id = `${input.type}_${input.relatedId}_${input.localDate}`;
  const timestamp = nowIso();
  const activity: Activity = {
    id,
    userId: input.userId,
    type: input.type,
    localDate: input.localDate,
    timezone: input.timezone,
    title: input.title,
    summary: input.title,
    sourceId: input.relatedId,
    sourceCollection: input.type,
    relatedId: input.relatedId,
    occurredAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeActivity(activity);
}
