import type { Goal } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc } from "./firestore";
import type { Repository } from "./types";

const COL = "goals";

export const goalsRepository: Repository<Goal> = {
  get: (userId, id) => getSubDoc<Goal>(userId, COL, id),
  list: (userId) => listSubDocs<Goal>(userId, COL),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
