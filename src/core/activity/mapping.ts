import type { ActivityDraft } from "@/core/types/activity";
import type { ManualLogKind } from "@/core/types/log";
import type { Note } from "@/core/types/note";
import type { StudySession } from "@/core/types/study";
import { WORKOUT_TYPE_LABELS, type Workout } from "@/core/types/workout";

export function activityIdFor(record: { id: string }): string {
  return record.id;
}

export function mapStudySessionToActivity(session: StudySession): ActivityDraft {
  const topic = session.topic.trim() || "Study";
  return {
    userId: session.userId,
    type: "study",
    localDate: session.localDate,
    timezone: session.timezone,
    title: `${topic} · ${session.durationMinutes} min`,
    relatedId: session.id,
    occurredAt: session.endedAt,
  };
}

export function mapWorkoutToActivity(workout: Workout): ActivityDraft {
  return {
    userId: workout.userId,
    type: "workout",
    localDate: workout.localDate,
    timezone: workout.timezone,
    title: `${WORKOUT_TYPE_LABELS[workout.type]} · ${workout.durationMinutes} min`,
    relatedId: workout.id,
    occurredAt: workout.createdAt,
  };
}

export function mapManualNoteToActivity(note: Note): ActivityDraft {
  const title = note.body.trim().split(/\n/)[0]?.slice(0, 80) || "Note";
  return {
    userId: note.userId,
    type: "note",
    localDate: note.localDate,
    timezone: note.timezone,
    title,
    relatedId: note.id,
    occurredAt: note.createdAt,
  };
}

export function mapGenericActivity(input: {
  userId: string;
  localDate: string;
  timezone: string;
  title: string;
  relatedId: string;
  occurredAt: string;
  type: "activity" | "custom";
}): ActivityDraft {
  return {
    userId: input.userId,
    type: input.type,
    localDate: input.localDate,
    timezone: input.timezone,
    title: input.title.trim() || (input.type === "custom" ? "Custom" : "Activity"),
    relatedId: input.relatedId,
    occurredAt: input.occurredAt,
  };
}

export function hrefForManualLogKind(kind: ManualLogKind): string | null {
  switch (kind) {
    case "expense":
      return "/money?add=expense";
    case "income":
      return "/money?add=income";
    case "study":
      return "/study/start";
    case "workout":
      return "/workout";
    case "prayer":
      return "/today?quick=prayer";
    case "task":
      return "/today?quick=task";
    case "habit":
      return "/today?quick=habit";
    case "mood":
      return "/today/reflection";
    case "note":
    case "activity":
    case "custom":
      return null;
  }
}
