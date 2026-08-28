import type { PrayerEntry, PrayerKey } from "@/core/types";
import { PRAYER_LABELS } from "@/core/types";
import { nowIso } from "@/lib/firebase/timestamps";
import { prayerEntryId } from "@/repositories/paths";
import { writePrayerEntry } from "@/repositories/prayers";
import { emitActivity } from "./activityService";

export function completedPrayerEntry(input: {
  userId: string;
  prayerKey: PrayerKey;
  existing: PrayerEntry | null;
  localDate: string;
  timezone: string;
  note?: string | null;
}): PrayerEntry {
  const timestamp = nowIso();
  return {
    id: input.existing?.id ?? prayerEntryId(input.prayerKey, input.localDate),
    userId: input.userId,
    prayerKey: input.prayerKey,
    prayer: input.prayerKey,
    localDate: input.localDate,
    timezone: input.timezone,
    completed: true,
    status: "on_time",
    note: input.note === undefined ? input.existing?.note ?? null : input.note,
    loggedAt: timestamp,
    createdAt: input.existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export async function completePrayer(input: {
  userId: string;
  prayerKey: PrayerKey;
  existing: PrayerEntry | null;
  localDate: string;
  timezone: string;
  note?: string | null;
}): Promise<PrayerEntry> {
  const entry = completedPrayerEntry(input);
  await writePrayerEntry(entry);
  await emitActivity({
    userId: input.userId,
    type: "prayer",
    localDate: input.localDate,
    timezone: input.timezone,
    title: PRAYER_LABELS[input.prayerKey],
    relatedId: input.prayerKey,
  });
  return entry;
}

export async function savePrayerNote(input: {
  userId: string;
  prayerKey: PrayerKey;
  existing: PrayerEntry | null;
  localDate: string;
  timezone: string;
  note: string | null;
  completed: boolean;
}): Promise<PrayerEntry> {
  const timestamp = nowIso();
  const entry: PrayerEntry = {
    id: input.existing?.id ?? prayerEntryId(input.prayerKey, input.localDate),
    userId: input.userId,
    prayerKey: input.prayerKey,
    prayer: input.prayerKey,
    localDate: input.localDate,
    timezone: input.timezone,
    completed: input.completed,
    status: input.completed ? "on_time" : "unlogged",
    note: input.note,
    loggedAt: input.completed ? timestamp : input.existing?.loggedAt ?? null,
    createdAt: input.existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await writePrayerEntry(entry);
  if (entry.completed) {
    await emitActivity({
      userId: input.userId,
      type: "prayer",
      localDate: input.localDate,
      timezone: input.timezone,
      title: PRAYER_LABELS[input.prayerKey],
      relatedId: input.prayerKey,
    });
  }
  return entry;
}
