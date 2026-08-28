import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { MoneyCategory } from "@/core/types/money";
import { userCollection } from "@/lib/firebase/paths";
import { fromTimestamp, omitUndefined, toTimestamp } from "./converters";
import type { Repository } from "./types";

function col(userId: string) {
  return userCollection(userId, "categories");
}

function fromDoc(id: string, data: Record<string, unknown>): MoneyCategory {
  const createdAt = fromTimestamp(data.createdAt, new Date());
  const kind = data.kind;
  return {
    id,
    userId: String(data.userId),
    name: String(data.name),
    kind: kind === "income" || kind === "both" ? kind : "expense",
    sortOrder: Number(data.sortOrder ?? 0),
    archived: Boolean(data.archived),
    createdAt,
    updatedAt: fromTimestamp(data.updatedAt, createdAt),
  };
}

export interface CategoryWrite {
  id: string;
  userId: string;
  name: string;
  kind: MoneyCategory["kind"];
  sortOrder: number;
  archived?: boolean;
}

export async function upsertCategory(input: CategoryWrite): Promise<void> {
  const now = new Date();
  await setDoc(
    doc(col(input.userId), input.id),
    omitUndefined({
      userId: input.userId,
      name: input.name,
      kind: input.kind,
      sortOrder: input.sortOrder,
      archived: input.archived ?? false,
      createdAt: toTimestamp(now),
      updatedAt: toTimestamp(now),
    }),
    { merge: true },
  );
}

export async function archiveCategory(
  userId: string,
  id: string,
): Promise<void> {
  await setDoc(
    doc(col(userId), id),
    { archived: true, updatedAt: toTimestamp(new Date()) },
    { merge: true },
  );
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(col(userId), id));
}

export function listenCategories(
  userId: string,
  onNext: (rows: MoneyCategory[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(col(userId), orderBy("sortOrder", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((item) => fromDoc(item.id, item.data())));
    },
    (error) => onError(error),
  );
}

export async function listCategories(userId: string): Promise<MoneyCategory[]> {
  const snap = await getDocs(query(col(userId), orderBy("sortOrder", "asc")));
  return snap.docs.map((item) => fromDoc(item.id, item.data()));
}

export const categoriesRepository: Repository<MoneyCategory> = {
  async get(userId, id) {
    const snap = await getDoc(doc(col(userId), id));
    return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
  },
  list: listCategories,
  upsert: (record) => upsertCategory(record),
  remove: deleteCategory,
};
