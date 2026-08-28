export type TimerStatus = "idle" | "running" | "paused";

export function durationMinutesFromRange(startedAtIso: string, endedAtIso: string): number {
  const ms = Date.parse(endedAtIso) - Date.parse(startedAtIso);
  if (!Number.isFinite(ms) || ms <= 0) {
    return 0;
  }
  const rounded = Math.round(ms / 60_000);
  return Math.max(1, rounded);
}

export function timerElapsedMs(input: {
  status: TimerStatus;
  accumulatedMs: number;
  resumedAt: string | null;
  nowMs: number;
}): number {
  if (input.status === "idle") {
    return 0;
  }
  if (input.status === "paused" || input.resumedAt === null) {
    return Math.max(0, input.accumulatedMs);
  }
  const live = input.nowMs - Date.parse(input.resumedAt);
  return Math.max(0, input.accumulatedMs + (Number.isFinite(live) ? live : 0));
}

export function formatElapsedClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
