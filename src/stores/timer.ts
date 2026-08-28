"use client";

import { create } from "zustand";

interface TimerState {
  running: boolean;
  startedAt: string | null;
  elapsedSeconds: number;
  subjectId: string | null;
  start: (subjectId: string | null) => void;
  stop: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  running: false,
  startedAt: null,
  elapsedSeconds: 0,
  subjectId: null,
  start: (subjectId) =>
    set({
      running: true,
      startedAt: new Date().toISOString(),
      subjectId,
    }),
  stop: () => set({ running: false }),
  reset: () =>
    set({
      running: false,
      startedAt: null,
      elapsedSeconds: 0,
      subjectId: null,
    }),
}));
