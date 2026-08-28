import {
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { Budget } from "@/core/types/money";
import { userCollection } from "@/lib/firebase/paths";
import { fromTimestamp, omitUndefined, toTimestamp } from "./converters";

function col(userId: string) {
  return userCollection(userId, "budgets");
}

function fromDoc(id: string, data: Record<string, unknown>): Budget {
  const createdAt = fromTimestamp(data.createdAt, new Date());
  return {
    id,
    userId: String(data.userId),
    monthKey: String(data.monthKey),
    type: data.type === "category" ? "category" : "overall",
    categoryId:
      typeof data.categoryId === "string" ? data.categoryId : undefined,
    amount: Number(data.amount),
    createdAt,
    updatedAt: fromTimestamp(data.updatedAt, createdAt),
  };
}

export interface BudgetWrite {
  id: string;
  userId: string;
  monthKey: string;
  type: Budget["type"];
  categoryId?: string;
  amount: number;
}

export async function upsertBudget(input: BudgetWrite): Promise<void> {
  const now = new Date();
  await setDoc(
    doc(col(input.userId), input.id),
    omitUndefined({
      userId: input.userId,
      monthKey: input.monthKey,
      type: input.type,
      categoryId: input.categoryId,
      amount: input.amount,
      createdAt: toTimestamp(now),
      updatedAt: toTimestamp(now),
    }),
    { merge: true },
  );
}

export async function deleteBudget(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(col(userId), id));
}

export function listenBudgetsForMonth(
  userId: string,
  monthKey: string,
  onNext: (rows: Budget[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(col(userId), where("monthKey", "==", monthKey));
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((item) => fromDoc(item.id, item.data())));
    },
    (error) => onError(error),
  );
}

export const budgetsRepository = {
  get: async () => null,
  list: async () => [],
  upsert: (record: Budget) =>
    upsertBudget({
      id: record.id,
      userId: record.userId,
      monthKey: record.monthKey,
      type: record.type,
      categoryId: record.categoryId,
      amount: record.amount,
    }),
  remove: deleteBudget,
};
