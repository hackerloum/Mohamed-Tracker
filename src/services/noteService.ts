import type { Note } from "@/core/types";
import { nowIso } from "@/lib/firebase/timestamps";
import { newDocumentId } from "@/repositories/ids";
import { writeNote } from "@/repositories/notes";
import { emitActivity } from "./activityService";

export async function createNote(input: {
  userId: string;
  body: string;
  localDate: string;
  timezone: string;
}): Promise<Note> {
  const timestamp = nowIso();
  const note: Note = {
    id: newDocumentId(input.userId, "notes"),
    userId: input.userId,
    body: input.body,
    localDate: input.localDate,
    timezone: input.timezone,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeNote(note);
  const preview = input.body.length > 80 ? `${input.body.slice(0, 77)}…` : input.body;
  await emitActivity({
    userId: input.userId,
    type: "note",
    localDate: input.localDate,
    timezone: input.timezone,
    title: preview,
    relatedId: note.id,
  });
  return note;
}
