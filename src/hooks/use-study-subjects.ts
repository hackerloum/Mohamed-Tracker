"use client";

import { useEffect, useState } from "react";
import type { StudySubject } from "@/core/types/study";
import { isFirebaseConfigured } from "@/lib/firebase/app";
import { subscribeStudySubjects } from "@/repositories/study-subjects";

export function useStudySubjects(userId: string | null) {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const enabled = Boolean(userId && isFirebaseConfigured());

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      return;
    }
    return subscribeStudySubjects(userId, setSubjects);
  }, [userId]);

  return enabled ? subjects : [];
}
