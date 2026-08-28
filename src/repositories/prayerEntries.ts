export {
  subscribePrayerEntriesForDate,
  writePrayerEntry,
} from "./prayers";
import type { PrayerEntry } from "@/core/types";
import { deleteSubDoc, getSubDoc, listSubDocs, setSubDoc, whereLocalDate } from "./firestore";
import type { DatedRepository } from "./types";

const COL = "prayerEntries";

export const prayerEntriesRepository: DatedRepository<PrayerEntry> = {
  get: (userId, id) => getSubDoc<PrayerEntry>(userId, COL, id),
  list: (userId) => listSubDocs<PrayerEntry>(userId, COL),
  listByLocalDate: (userId, localDate) =>
    listSubDocs<PrayerEntry>(userId, COL, whereLocalDate(localDate)),
  upsert: (record) => setSubDoc(COL, record),
  remove: (userId, id) => deleteSubDoc(userId, COL, id),
};
