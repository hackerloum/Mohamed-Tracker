import type { Checkin } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "checkins";

export const checkinsRepository: DatedRepository<Checkin> = {
  get: (userId, id) => getSubDoc<Checkin>(userId, COL, id),
  list: (userId) => listSubDocs<Checkin>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<Checkin>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
