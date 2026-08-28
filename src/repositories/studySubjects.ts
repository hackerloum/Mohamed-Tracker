import type { StudySubject } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc } from "./firestore";
import type { Repository } from "./types";

const COL = "studySubjects";

export const studySubjectsRepository: Repository<StudySubject> = {
  get: (userId, id) => getSubDoc<StudySubject>(userId, COL, id),
  list: (userId) => listSubDocs<StudySubject>(userId, COL),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
