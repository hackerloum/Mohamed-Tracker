import { create } from "zustand";
import {
  durationMinutesFromRange,
  timerElapsedMs,
  type TimerStatus,
} from "@/core/study/duration";

interface StudyTimerState {
  status: TimerStatus;
  startedAt: string | null;
  accumulatedMs: number;
  resumedAt: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => { startedAt: string; endedAt: string; durationMinutes: number } | null;
  reset: () => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useStudyTimerStore = create<StudyTimerState>((set, get) => ({
  status: "idle",
  startedAt: null,
  accumulatedMs: 0,
  resumedAt: null,
  start: () => {
    const startedAt = nowIso();
    set({
      status: "running",
      startedAt,
      accumulatedMs: 0,
      resumedAt: startedAt,
    });
  },
  pause: () => {
    const current = get();
    if (current.status !== "running") {
      return;
    }
    set({
      status: "paused",
      accumulatedMs: timerElapsedMs({
        status: "running",
        accumulatedMs: current.accumulatedMs,
        resumedAt: current.resumedAt,
        nowMs: Date.now(),
      }),
      resumedAt: null,
    });
  },
  resume: () => {
    const current = get();
    if (current.status !== "paused") {
      return;
    }
    set({ status: "running", resumedAt: nowIso() });
  },
  stop: () => {
    const current = get();
    if (current.status === "idle" || !current.startedAt) {
      return null;
    }
    const endedAt = nowIso();
    const elapsed = timerElapsedMs({
      status: current.status,
      accumulatedMs: current.accumulatedMs,
      resumedAt: current.resumedAt,
      nowMs: Date.now(),
    });
    const startedAt = new Date(Date.parse(endedAt) - elapsed).toISOString();
    const durationMinutes = durationMinutesFromRange(startedAt, endedAt);
    set({ status: "idle", startedAt: null, accumulatedMs: 0, resumedAt: null });
    if (durationMinutes <= 0) {
      return null;
    }
    return { startedAt, endedAt, durationMinutes };
  },
  reset: () => {
    set({ status: "idle", startedAt: null, accumulatedMs: 0, resumedAt: null });
  },
}));
