import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";
import type { Task } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readBoolean, readIso, readString, readStringOrNull } from "./parse";
import { userCollectionPath } from "./paths";

function parseTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    userId: readString(data, "userId"),
    title: readString(data, "title"),
    notes: readString(data, "notes"),
    status: readString(data, "status", "open") === "done" || readBoolean(data, "completed")
      ? "done"
      : readString(data, "status") === "cancelled"
        ? "cancelled"
        : "open",
    sortOrder: 0,
    dueLocalDate: readStringOrNull(data, "dueLocalDate"),
    localDate: readStringOrNull(data, "localDate"),
    timezone: readString(data, "timezone"),
    completed: readBoolean(data, "completed"),
    priority: readBoolean(data, "priority"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function tasksCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, "tasks"));
}

export function subscribeTasksForDate(
  userId: string,
  localDate: string,
  onChange: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(tasksCol(userId), where("localDate", "==", localDate));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs
          .map((item) => parseTask(item.id, asRecord(item.data())))
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
      ),
    (error) => onError(error),
  );
}

export async function listTasksForDate(userId: string, localDate: string): Promise<Task[]> {
  const q = query(tasksCol(userId), where("localDate", "==", localDate));
  const snap = await getDocs(q);
  return snap.docs
    .map((item) => parseTask(item.id, asRecord(item.data())))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function writeTask(task: Task): Promise<void> {
  await setDoc(doc(tasksCol(task.userId), task.id), {
    userId: task.userId,
    title: task.title,
    localDate: task.localDate,
    timezone: task.timezone,
    completed: task.completed,
    priority: task.priority,
    createdAt: task.createdAt,
    updatedAt: nowIso(),
  });
}

import { deleteSubDoc, getSubDoc, listSubDocs } from "./firestore";
import type { DatedRepository } from "./types";

export const tasksRepository: DatedRepository<Task> = {
  get: (userId, id) => getSubDoc<Task>(userId, "tasks", id),
  list: (userId) => listSubDocs<Task>(userId, "tasks"),
  listByLocalDate: async (userId, localDate) =>
    listSubDocs<Task>(userId, "tasks").then((rows) =>
      rows.filter((row) => row.localDate === localDate),
    ),
  upsert: (record) => writeTask(record),
  remove: (userId, id) => deleteSubDoc(userId, "tasks", id),
};
