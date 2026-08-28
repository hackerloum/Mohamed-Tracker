"use client";

import { useEffect, useState } from "react";
import { timerElapsedMs } from "@/core/study/duration";
import { useStudyTimerStore } from "@/stores/study-timer";

export function useTimerClock(): number {
  const status = useStudyTimerStore((s) => s.status);
  const accumulatedMs = useStudyTimerStore((s) => s.accumulatedMs);
  const resumedAt = useStudyTimerStore((s) => s.resumedAt);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "running") {
      return;
    }
    const id = window.setInterval(() => setNowMs(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [status]);

  return timerElapsedMs({ status, accumulatedMs, resumedAt, nowMs });
}
