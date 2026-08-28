import { describe, expect, it } from "vitest";
import { activityIdFor, mapManualNoteToActivity, mapStudySessionToActivity, mapWorkoutToActivity } from "./mapping";
import type { StudySession } from "@/core/types/study";
import type { Workout } from "@/core/types/workout";
import type { Note } from "@/core/types/note";

const session: StudySession = {
  id: "study-1",
  userId: "user-1",
  createdAt: "2026-08-28T08:25:00.000Z",
  updatedAt: "2026-08-28T08:25:00.000Z",
  localDate: "2026-08-28",
  timezone: "Africa/Dar_es_Salaam",
  subjectId: "sub-1",
  topic: "Arabic grammar",
  notes: "Nouns",
  startedAt: "2026-08-28T08:00:00.000Z",
  endedAt: "2026-08-28T08:25:00.000Z",
  durationMinutes: 25,
};

const workout: Workout = {
  id: "wo-1",
  userId: "user-1",
  createdAt: "2026-08-28T17:00:00.000Z",
  updatedAt: "2026-08-28T17:00:00.000Z",
  localDate: "2026-08-28",
  timezone: "Africa/Dar_es_Salaam",
  type: "gym",
  durationMinutes: 40,
  notes: null,
  sets: [{ exercise: "Bench", reps: 8, weightKg: 60 }],
};

describe("mapStudySessionToActivity", () => {
  it("maps a study session onto a study activity event", () => {
    expect(mapStudySessionToActivity(session)).toEqual({
      userId: "user-1",
      type: "study",
      localDate: "2026-08-28",
      timezone: "Africa/Dar_es_Salaam",
      title: "Arabic grammar · 25 min",
      relatedId: "study-1",
      occurredAt: "2026-08-28T08:25:00.000Z",
    });
  });

  it("falls back to Study when topic is blank", () => {
    expect(mapStudySessionToActivity({ ...session, topic: "  " }).title).toBe(
      "Study · 25 min",
    );
  });
});

describe("mapWorkoutToActivity", () => {
  it("maps a workout onto a workout activity event", () => {
    expect(mapWorkoutToActivity(workout)).toEqual({
      userId: "user-1",
      type: "workout",
      localDate: "2026-08-28",
      timezone: "Africa/Dar_es_Salaam",
      title: "Gym · 40 min",
      relatedId: "wo-1",
      occurredAt: "2026-08-28T17:00:00.000Z",
    });
  });
});

describe("mapManualNoteToActivity", () => {
  it("maps a note onto a note activity event", () => {
    const note: Note = {
      id: "note-1",
      userId: "user-1",
      createdAt: "2026-08-28T12:00:00.000Z",
      updatedAt: "2026-08-28T12:00:00.000Z",
      localDate: "2026-08-28",
      timezone: "Africa/Dar_es_Salaam",
      body: "Call mum after maghrib",
    };
    expect(mapManualNoteToActivity(note)).toEqual({
      userId: "user-1",
      type: "note",
      localDate: "2026-08-28",
      timezone: "Africa/Dar_es_Salaam",
      title: "Call mum after maghrib",
      relatedId: "note-1",
      occurredAt: "2026-08-28T12:00:00.000Z",
    });
  });
});

describe("activityIdFor", () => {
  it("reuses the source record id so timeline upserts stay idempotent", () => {
    expect(activityIdFor(session)).toBe("study-1");
    expect(activityIdFor(workout)).toBe("wo-1");
  });
});
