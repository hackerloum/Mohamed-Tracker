"use client";

import { useEffect, useState } from "react";
import type { StudySession } from "@/core/types/study";
import { subscribeStudySessions } from "@/repositories/study-sessions";
import { isFirebaseConfigured } from "@/lib/firebase/app";

export function useStudySessions(userId: string | null, from: string, to: string) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const enabled = Boolean(userId && isFirebaseConfigured());

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      return;
    }
    return subscribeStudySessions(userId, from, to, setSessions);
  }, [userId, from, to]);

  return enabled ? sessions : [];
}
