import {
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import type { Workout, WorkoutSet, WorkoutType } from "@/core/types/workout";
import { WORKOUT_TYPES } from "@/core/types/workout";
import { getDb } from "@/lib/firebase/firestore";
import { userCollection } from "@/lib/firebase/paths";
import { asIso, asNullableString, asNumber, asString, isoNow } from "./convert";

export type WorkoutWrite = Omit<Workout, "id" | "createdAt" | "updatedAt">;

export function createWorkout(input: WorkoutWrite): Promise<Workout> {
  const now = isoNow();
  const payload = { ...input, createdAt: now, updatedAt: now };
  return addDoc(userCollection(getDb(), input.userId, "workouts"), payload).then(
    (ref) => ({ ...payload, id: ref.id }),
  );
}

export function subscribeWorkouts(
  userId: string,
  from: string,
  to: string,
  onChange: (workouts: Workout[]) => void,
): Unsubscribe {
  const q = query(
    userCollection(getDb(), userId, "workouts"),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((docSnap) => toWorkout(docSnap.id, docSnap.data())));
  });
}

function toWorkout(id: string, data: DocumentData): Workout {
  const createdAt = asIso(data.createdAt, isoNow());
  return {
    id,
    userId: asString(data.userId),
    createdAt,
    updatedAt: asIso(data.updatedAt, createdAt),
    localDate: asString(data.localDate),
    timezone: asString(data.timezone),
    type: asWorkoutType(data.type),
    durationMinutes: asNumber(data.durationMinutes),
    notes: asNullableString(data.notes),
    sets: asSets(data.sets),
  };
}

export async function listWorkoutsInRange(
  userId: string,
  from: string,
  to: string,
): Promise<Workout[]> {
  const q = query(
    userCollection(getDb(), userId, "workouts"),
    where("localDate", ">=", from),
    where("localDate", "<=", to),
    orderBy("localDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => toWorkout(docSnap.id, docSnap.data()));
}

export const workoutsRepository = {
  get: async () => null,
  list: async (userId: string) => listWorkoutsInRange(userId, "0000-01-01", "9999-12-31"),
  listByLocalDate: (userId: string, localDate: string) =>
    listWorkoutsInRange(userId, localDate, localDate),
  upsert: async () => undefined,
  remove: async () => undefined,
};

function asWorkoutType(value: unknown): WorkoutType {
  return WORKOUT_TYPES.includes(value as WorkoutType) ? (value as WorkoutType) : "other";
}

function asSets(value: unknown): WorkoutSet[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => {
    const row = (item ?? {}) as DocumentData;
    return {
      exercise: asString(row.exercise),
      reps: typeof row.reps === "number" ? row.reps : null,
      weightKg: typeof row.weightKg === "number" ? row.weightKg : null,
    };
  });
}
