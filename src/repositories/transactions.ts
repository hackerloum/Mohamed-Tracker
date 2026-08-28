import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { Transaction } from "@/core/types/money";
import { userCollection } from "@/lib/firebase/paths";
import {
  fromTimestamp,
  omitUndefined,
  toTimestamp,
} from "./converters";

function col(userId: string) {
  return userCollection(userId, "transactions");
}

function fromDoc(
  id: string,
  data: Record<string, unknown>,
): Transaction {
  const createdAt = fromTimestamp(data.createdAt, new Date());
  return {
    id,
    userId: String(data.userId),
    type: data.type === "income" ? "income" : "expense",
    kind: data.type === "income" ? "income" : "expense",
    amount: Number(data.amount),
    currency: String(data.currency ?? "TZS"),
    categoryId: String(data.categoryId),
    paymentMethodId:
      typeof data.paymentMethodId === "string"
        ? data.paymentMethodId
        : undefined,
    description:
      typeof data.description === "string" ? data.description : undefined,
    note: typeof data.note === "string" ? data.note : undefined,
    localDate: String(data.localDate),
    timezone: String(data.timezone),
    createdAt,
    updatedAt: fromTimestamp(data.updatedAt, createdAt),
  };
}

export interface NewTransaction {
  userId: string;
  type: Transaction["type"];
  amount: number;
  currency: string;
  categoryId: string;
  paymentMethodId?: string;
  description?: string;
  note?: string;
  localDate: string;
  timezone: string;
}

export async function createTransaction(
  input: NewTransaction,
): Promise<string> {
  const now = new Date();
  const ref = await addDoc(col(input.userId), {
    ...omitUndefined({
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      categoryId: input.categoryId,
      paymentMethodId: input.paymentMethodId,
      description: input.description,
      note: input.note,
      localDate: input.localDate,
      timezone: input.timezone,
    }),
    createdAt: toTimestamp(now),
    updatedAt: toTimestamp(now),
    createdAtServer: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransaction(
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Transaction,
      | "amount"
      | "categoryId"
      | "paymentMethodId"
      | "description"
      | "note"
      | "localDate"
    >
  >,
): Promise<void> {
  await updateDoc(doc(col(userId), id), {
    ...omitUndefined({ ...patch }),
    updatedAt: toTimestamp(new Date()),
  });
}

export async function deleteTransaction(
  userId: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(col(userId), id));
}

export function listenTransactionsInRange(
  userId: string,
  start: string,
  end: string,
  onNext: (rows: Transaction[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    col(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
    orderBy("localDate", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((item) => fromDoc(item.id, item.data()));
      rows.sort((a, b) => {
        if (a.localDate !== b.localDate) {
          return b.localDate.localeCompare(a.localDate);
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      onNext(rows);
    },
    (error) => onError(error),
  );
}

export async function listTransactionsInRange(
  userId: string,
  start: string,
  end: string,
): Promise<Transaction[]> {
  const q = query(
    col(userId),
    where("localDate", ">=", start),
    where("localDate", "<=", end),
    orderBy("localDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => fromDoc(item.id, item.data()));
}

export const transactionsRepository = {
  get: async () => null,
  list: async (userId: string) => listTransactionsInRange(userId, "0000-01-01", "9999-12-31"),
  listByLocalDate: (userId: string, localDate: string) =>
    listTransactionsInRange(userId, localDate, localDate),
  upsert: async () => undefined,
  remove: deleteTransaction,
};
