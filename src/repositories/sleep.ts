import type { SleepLog } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "sleep";

export const sleepRepository: DatedRepository<SleepLog> = {
  get: (userId, id) => getSubDoc<SleepLog>(userId, COL, id),
  list: (userId) => listSubDocs<SleepLog>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<SleepLog>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
