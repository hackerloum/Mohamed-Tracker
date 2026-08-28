import { describe, expect, it } from "vitest";
import { computeStudyAnalytics } from "./analytics";
import type { StudySession } from "@/core/types/study";

function session(
  overrides: Partial<StudySession> & Pick<StudySession, "id" | "localDate" | "topic" | "durationMinutes">,
): StudySession {
  return {
    userId: "user-1",
    createdAt: "2026-08-28T08:00:00.000Z",
    updatedAt: "2026-08-28T08:00:00.000Z",
    timezone: "Africa/Dar_es_Salaam",
    subjectId: null,
    notes: null,
    startedAt: "2026-08-28T08:00:00.000Z",
    endedAt: "2026-08-28T08:30:00.000Z",
    ...overrides,
  };
}

describe("computeStudyAnalytics", () => {
  const sessions: StudySession[] = [
    session({ id: "a", localDate: "2026-08-28", topic: "Arabic", durationMinutes: 40 }),
    session({ id: "b", localDate: "2026-08-28", topic: "Fiqh", durationMinutes: 20 }),
    session({ id: "c", localDate: "2026-08-27", topic: "Arabic", durationMinutes: 30 }),
    session({ id: "d", localDate: "2026-08-21", topic: "History", durationMinutes: 60 }),
    session({ id: "e", localDate: "2026-07-30", topic: "Arabic", durationMinutes: 90 }),
  ];

  it("sums today, week, month, total hours, and average from real sessions", () => {
    const stats = computeStudyAnalytics(sessions, "2026-08-28");
    expect(stats.todayMinutes).toBe(60);
    expect(stats.weekMinutes).toBe(90);
    expect(stats.monthMinutes).toBe(150);
    expect(stats.totalHours).toBe(4);
    expect(stats.averageSessionMinutes).toBe(48);
    expect(stats.sessionCount).toBe(5);
  });

  it("ranks top topics by minutes", () => {
    const stats = computeStudyAnalytics(sessions, "2026-08-28");
    expect(stats.topTopics).toEqual([
      { topic: "Arabic", minutes: 160 },
      { topic: "History", minutes: 60 },
      { topic: "Fiqh", minutes: 20 },
    ]);
  });

  it("counts a consecutive-day streak ending today", () => {
    expect(computeStudyAnalytics(sessions, "2026-08-28").streakDays).toBe(2);
    expect(computeStudyAnalytics(sessions, "2026-08-29").streakDays).toBe(0);
  });

  it("returns zeros when there are no sessions", () => {
    expect(computeStudyAnalytics([], "2026-08-28")).toEqual({
      todayMinutes: 0,
      weekMinutes: 0,
      monthMinutes: 0,
      totalHours: 0,
      averageSessionMinutes: 0,
      sessionCount: 0,
      streakDays: 0,
      topTopics: [],
    });
  });
});
