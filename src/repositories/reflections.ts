import type { Reflection } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "reflections";

export const reflectionsRepository: DatedRepository<Reflection> = {
  get: (userId, id) => getSubDoc<Reflection>(userId, COL, id),
  list: (userId) => listSubDocs<Reflection>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<Reflection>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
