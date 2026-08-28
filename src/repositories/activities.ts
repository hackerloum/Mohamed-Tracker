import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { Activity, ActivityDraft, ActivityType } from "@/core/types/activity";
import { ACTIVITY_TYPES } from "@/core/types/activity";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asIso, asString } from "./convert";
import { deleteSubDoc, getSubDoc, listSubDocs, whereLocalDate } from "./firestore";
import { userCollectionPath } from "./paths";
import type { DatedRepository } from "./types";

const COL = "activities";

function activitiesCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, COL));
}

function complete(activity: Activity): Activity {
  return {
    ...activity,
    summary: activity.summary || activity.title,
    sourceId: activity.sourceId || activity.relatedId,
    sourceCollection: activity.sourceCollection || activity.type,
    relatedId: activity.relatedId || activity.sourceId,
    occurredAt: activity.occurredAt || activity.createdAt,
  };
}

export async function writeActivity(activity: Activity): Promise<void> {
  const record = complete(activity);
  await setDoc(doc(activitiesCol(record.userId), record.id), {
    userId: record.userId,
    type: record.type,
    localDate: record.localDate,
    timezone: record.timezone,
    title: record.title,
    summary: record.summary,
    sourceId: record.sourceId,
    sourceCollection: record.sourceCollection,
    relatedId: record.relatedId,
    occurredAt: record.occurredAt,
    createdAt: record.createdAt,
    updatedAt: nowIso(),
  });
}

export async function upsertActivity(id: string, draft: ActivityDraft): Promise<Activity> {
  const now = nowIso();
  const activity = complete({
    ...draft,
    id,
    summary: draft.summary ?? draft.title,
    sourceId: draft.sourceId ?? draft.relatedId,
    sourceCollection: draft.sourceCollection ?? draft.type,
    relatedId: draft.relatedId,
    createdAt: now,
    updatedAt: now,
    occurredAt: draft.occurredAt || now,
  });
  await writeActivity(activity);
  return activity;
}

export function subscribeActivities(
  userId: string,
  from: string,
  to: string,
  onChange: (activities: Activity[]) => void,
): Unsubscribe {
  const q = query(
    activitiesCol(userId),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs
        .map((item) => toActivity(item.id, item.data()))
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    );
  });
}

export async function listActivitiesInRange(
  userId: string,
  from: string,
  to: string,
): Promise<Activity[]> {
  const q = query(
    activitiesCol(userId),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((item) => toActivity(item.id, item.data()))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function toActivity(id: string, data: DocumentData): Activity {
  const createdAt = asIso(data.createdAt, nowIso());
  const type = ACTIVITY_TYPES.includes(data.type as ActivityType)
    ? (data.type as ActivityType)
    : "custom";
  const relatedId = asString(data.relatedId, asString(data.sourceId, id));
  return complete({
    id,
    userId: asString(data.userId),
    createdAt,
    updatedAt: asIso(data.updatedAt, createdAt),
    type,
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    title: asString(data.title),
    summary: asString(data.summary, asString(data.title)),
    sourceId: asString(data.sourceId, relatedId),
    sourceCollection: asString(data.sourceCollection, type),
    relatedId,
    occurredAt: asIso(data.occurredAt, createdAt),
  });
}

export const activitiesRepository: DatedRepository<Activity> = {
  get: (userId, id) => getSubDoc<Activity>(userId, COL, id),
  list: (userId) => listSubDocs<Activity>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<Activity>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => writeActivity(record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
