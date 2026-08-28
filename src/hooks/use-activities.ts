"use client";

import { useEffect, useState } from "react";
import type { Activity } from "@/core/types/activity";
import { isFirebaseConfigured } from "@/lib/firebase/app";
import { subscribeActivities } from "@/repositories/activities";

export function useActivities(userId: string | null, from: string, to: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const enabled = Boolean(userId && isFirebaseConfigured());

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      return;
    }
    return subscribeActivities(userId, from, to, setActivities);
  }, [userId, from, to]);

  return enabled ? activities : [];
}
