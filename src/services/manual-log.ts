import { toLocalDate } from "@/core/dates/localDate";
import {
  activityIdFor,
  mapGenericActivity,
  mapManualNoteToActivity,
} from "@/core/activity/mapping";
import { manualActivityInputSchema, noteInputSchema } from "@/core/schemas/log";
import { createNote } from "@/repositories/notes";
import { upsertActivity } from "@/repositories/activities";

export async function logNote(input: {
  userId: string;
  timezone: string;
  body: string;
}) {
  const parsed = noteInputSchema.parse(input);
  const now = new Date();
  const note = await createNote({
    userId: input.userId,
    body: parsed.body,
    timezone: parsed.timezone,
    localDate: toLocalDate(now, parsed.timezone),
  });
  await upsertActivity(activityIdFor(note), mapManualNoteToActivity(note));
  return note;
}

export async function logGenericActivity(input: {
  userId: string;
  timezone: string;
  type: "activity" | "custom";
  title: string;
  notes: string | null;
}) {
  const parsed = manualActivityInputSchema.parse(input);
  const now = new Date();
  const occurredAt = now.toISOString();
  const localDate = toLocalDate(now, parsed.timezone);
  const relatedId = crypto.randomUUID();
  const draft = mapGenericActivity({
    userId: input.userId,
    localDate,
    timezone: parsed.timezone,
    title: parsed.notes ? `${parsed.title} — ${parsed.notes}` : parsed.title,
    relatedId,
    occurredAt,
    type: parsed.type,
  });
  return upsertActivity(relatedId, draft);
}
