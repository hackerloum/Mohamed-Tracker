import {
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { PaymentMethod } from "@/core/types/money";
import { userCollection } from "@/lib/firebase/paths";
import { fromTimestamp, omitUndefined, toTimestamp } from "./converters";

function col(userId: string) {
  return userCollection(userId, "paymentMethods");
}

function fromDoc(id: string, data: Record<string, unknown>): PaymentMethod {
  const createdAt = fromTimestamp(data.createdAt, new Date());
  return {
    id,
    userId: String(data.userId),
    name: String(data.name),
    sortOrder: Number(data.sortOrder ?? 0),
    archived: Boolean(data.archived),
    createdAt,
    updatedAt: fromTimestamp(data.updatedAt, createdAt),
  };
}

export interface PaymentMethodWrite {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  archived?: boolean;
}

export async function upsertPaymentMethod(
  input: PaymentMethodWrite,
): Promise<void> {
  const now = new Date();
  await setDoc(
    doc(col(input.userId), input.id),
    omitUndefined({
      userId: input.userId,
      name: input.name,
      sortOrder: input.sortOrder,
      archived: input.archived ?? false,
      createdAt: toTimestamp(now),
      updatedAt: toTimestamp(now),
    }),
    { merge: true },
  );
}

export async function archivePaymentMethod(
  userId: string,
  id: string,
): Promise<void> {
  await setDoc(
    doc(col(userId), id),
    { archived: true, updatedAt: toTimestamp(new Date()) },
    { merge: true },
  );
}

export async function deletePaymentMethod(
  userId: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(col(userId), id));
}

export function listenPaymentMethods(
  userId: string,
  onNext: (rows: PaymentMethod[]) => void,
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
