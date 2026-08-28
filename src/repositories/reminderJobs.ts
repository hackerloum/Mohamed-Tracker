import type { ReminderJob } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc } from "./firestore";
import type { Repository } from "./types";

const COL = "reminderJobs";

export const reminderJobsRepository: Repository<ReminderJob> = {
  get: (userId, id) => getSubDoc<ReminderJob>(userId, COL, id),
  list: (userId) => listSubDocs<ReminderJob>(userId, COL),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
