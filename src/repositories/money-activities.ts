import {
  doc,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { Activity } from "@/core/types/activity";
import { userCollection } from "@/lib/firebase/paths";
import { omitUndefined, toTimestamp } from "./converters";

function col(userId: string) {
  return userCollection(userId, "activities");
}

export interface ActivityWrite {
  id: string;
  userId: string;
  type: Activity["type"];
  localDate: string;
  timezone: string;
  title: string;
  summary?: string;
  relatedId?: string;
  relatedCollection?: string;
  amount?: number;
}

export async function upsertActivity(input: ActivityWrite): Promise<void> {
  const now = new Date();
  await setDoc(
    doc(col(input.userId), input.id),
    omitUndefined({
      userId: input.userId,
      type: input.type,
      localDate: input.localDate,
      timezone: input.timezone,
      title: input.title,
      summary: input.summary,
      relatedId: input.relatedId,
      relatedCollection: input.relatedCollection,
      amount: input.amount,
      createdAt: toTimestamp(now),
      updatedAt: toTimestamp(now),
    }),
    { merge: true },
  );
}

export type { Unsubscribe };
