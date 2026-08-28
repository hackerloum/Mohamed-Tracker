"use client";

import { useEffect, useState } from "react";
import type { Workout } from "@/core/types/workout";
import { isFirebaseConfigured } from "@/lib/firebase/app";
import { subscribeWorkouts } from "@/repositories/workouts";

export function useWorkouts(userId: string | null, from: string, to: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const enabled = Boolean(userId && isFirebaseConfigured());

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      return;
    }
    return subscribeWorkouts(userId, from, to, setWorkouts);
  }, [userId, from, to]);

  return enabled ? workouts : [];
}
