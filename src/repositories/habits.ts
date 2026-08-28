import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Habit, HabitTargetCount } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readBoolean, readIso, readNumber, readString, readStringOrNull } from "./parse";
import { userCollectionPath } from "./paths";
import { getSubDoc } from "./firestore";
import type { Repository } from "./types";

function asTargetCount(value: number): HabitTargetCount {
  if (value === 2 || value === 3) return value;
  return 1;
}

function parseHabit(id: string, data: Record<string, unknown>): Habit {
  return {
    id,
    userId: readString(data, "userId"),
    name: readString(data, "name"),
    targetCount: asTargetCount(readNumber(data, "targetCount", 1)),
    icon: readString(data, "icon"),
    frequency: readString(data, "frequency", "daily") === "weekly" ? "weekly" : "daily",
    reminderTime: readStringOrNull(data, "reminderTime"),
    sortOrder: readNumber(data, "sortOrder"),
    archived: readBoolean(data, "archived"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function habitsCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, "habits"));
}

export function subscribeHabits(
  userId: string,
  onChange: (habits: Habit[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(habitsCol(userId), where("archived", "==", false));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs
          .map((item) => parseHabit(item.id, asRecord(item.data())))
          .sort((left, right) => left.sortOrder - right.sortOrder),
      ),
    (error) => onError(error),
  );
}

export async function listHabits(userId: string): Promise<Habit[]> {
  const q = query(habitsCol(userId), where("archived", "==", false));
  const snap = await getDocs(q);
  return snap.docs
    .map((item) => parseHabit(item.id, asRecord(item.data())))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function writeHabit(habit: Habit): Promise<void> {
  await setDoc(doc(habitsCol(habit.userId), habit.id), {
    userId: habit.userId,
    name: habit.name,
    icon: habit.icon,
    frequency: habit.frequency,
    reminderTime: habit.reminderTime,
    targetCount: habit.targetCount,
    sortOrder: habit.sortOrder,
    archived: habit.archived,
    createdAt: habit.createdAt,
    updatedAt: nowIso(),
  });
}

export async function archiveHabit(userId: string, habitId: string): Promise<void> {
  await updateDoc(doc(habitsCol(userId), habitId), {
    archived: true,
    updatedAt: nowIso(),
  });
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  await deleteDoc(doc(habitsCol(userId), habitId));
}

export const habitsRepository: Repository<Habit> = {
  get: (userId, id) => getSubDoc<Habit>(userId, "habits", id),
  list: (userId) => listHabits(userId),
  upsert: (record) => writeHabit(record),
  remove: (userId, id) => deleteHabit(userId, id),
};
