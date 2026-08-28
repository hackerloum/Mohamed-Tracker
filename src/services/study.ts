import { toLocalDate } from "@/core/dates/localDate";
import { durationMinutesFromRange } from "@/core/study/duration";
import { activityIdFor, mapStudySessionToActivity } from "@/core/activity/mapping";
import { studySessionInputSchema } from "@/core/schemas/log";
import type { StudySession } from "@/core/types/study";
import { createStudySession } from "@/repositories/study-sessions";
import { createStudySubject } from "@/repositories/study-subjects";
import { upsertActivity } from "@/repositories/activities";

export async function logStudySession(input: {
  userId: string;
  timezone: string;
  topic: string;
  subjectId: string | null;
  notes: string | null;
  startedAt: string;
  endedAt: string;
}): Promise<StudySession> {
  const parsed = studySessionInputSchema.parse({
    topic: input.topic,
    subjectId: input.subjectId,
    notes: input.notes,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    timezone: input.timezone,
  });
  const durationMinutes = durationMinutesFromRange(parsed.startedAt, parsed.endedAt);
  if (durationMinutes <= 0) {
    throw new Error("Study session needs a start and end.");
  }
  const session = await createStudySession({
    userId: input.userId,
    timezone: parsed.timezone,
    topic: parsed.topic,
    subjectId: parsed.subjectId,
    notes: parsed.notes,
    startedAt: parsed.startedAt,
    endedAt: parsed.endedAt,
    durationMinutes,
    localDate: toLocalDate(new Date(parsed.endedAt), parsed.timezone),
  });
  await upsertActivity(activityIdFor(session), mapStudySessionToActivity(session));
  return session;
}

export async function ensureStudySubject(userId: string, name: string) {
  return createStudySubject(userId, name);
}
