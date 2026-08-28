import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { AppNotification } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readBoolean, readIso, readString } from "./parse";
import { userCollectionPath } from "./paths";
import { deleteSubDoc, getSubDoc, listSubDocs, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "notifications";

function parseNotification(id: string, data: Record<string, unknown>): AppNotification {
  const payloadRaw = data.payload;
  const payload: Record<string, string> = {};
  if (typeof payloadRaw === "object" && payloadRaw !== null) {
    for (const [key, value] of Object.entries(payloadRaw as Record<string, unknown>)) {
      if (typeof value === "string") payload[key] = value;
    }
  }
  return {
    id,
    userId: readString(data, "userId"),
    localDate: readString(data, "localDate"),
    timezone: readString(data, "timezone"),
    title: readString(data, "title"),
    body: readString(data, "body"),
    read: readBoolean(data, "read"),
    channel: readString(data, "channel") === "push" ? "push" : "in-app",
    kind: readString(data, "kind"),
    payload,
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function notificationsCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, COL));
}

export async function listNotificationsInRange(
  userId: string,
  start: string,
  end: string,
): Promise<AppNotification[]> {
  const q = query(
    notificationsCol(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
    orderBy("localDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((item) => parseNotification(item.id, asRecord(item.data())))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeUnreadNotifications(
  userId: string,
  onChange: (rows: AppNotification[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    notificationsCol(userId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((item) => parseNotification(item.id, asRecord(item.data())))),
    (error) => onError(error),
  );
}

export async function writeNotification(record: AppNotification): Promise<void> {
  await setDoc(doc(notificationsCol(record.userId), record.id), {
    userId: record.userId,
    localDate: record.localDate,
    timezone: record.timezone,
    title: record.title,
    body: record.body,
    read: record.read,
    channel: record.channel,
    kind: record.kind,
    payload: record.payload,
    createdAt: record.createdAt,
    updatedAt: nowIso(),
  });
}

export async function markNotificationRead(userId: string, id: string): Promise<void> {
  await updateDoc(doc(notificationsCol(userId), id), {
    read: true,
    updatedAt: nowIso(),
  });
}

export const notificationsRepository: DatedRepository<AppNotification> = {
  get: (userId, id) => getSubDoc<AppNotification>(userId, COL, id),
  list: (userId) => listSubDocs<AppNotification>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<AppNotification>(userId, COL, whereLocalDate(localDate)),
  upsert: writeNotification,
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
