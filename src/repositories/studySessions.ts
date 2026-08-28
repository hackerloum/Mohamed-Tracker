import type { StudySession } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "studySessions";

export const studySessionsRepository: DatedRepository<StudySession> = {
  get: (userId, id) => getSubDoc<StudySession>(userId, COL, id),
  list: (userId) => listSubDocs<StudySession>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<StudySession>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
