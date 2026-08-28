"use client";

import { useEffect, useState } from "react";
import { addLocalDays, DEFAULT_TIMEZONE, todayLocalDate } from "@/core/dates/localDate";
import type { AppNotification } from "@/core/types";
import { useAuth } from "@/hooks/useAuth";
import {
  listNotificationsInRange,
  markNotificationRead,
  subscribeUnreadNotifications,
} from "@/repositories/notifications";
import { syncAppBadge } from "@/services/badge";

export function useNotificationsInbox() {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const today = todayLocalDate(timezone);
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void listNotificationsInRange(user.uid, addLocalDays(today, -29), today)
      .then((next) => {
        if (!cancelled) {
          setRows(next);
          setError(null);
          setLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load notifications.");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [today, user]);

  async function markRead(id: string) {
    if (!user) return;
    await markNotificationRead(user.uid, id);
    setRows((current) => current.map((row) => (row.id === id ? { ...row, read: true } : row)));
  }

  return { rows, loading: Boolean(user) && !loaded, error, markRead };
}

export function useUnreadBadge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    return subscribeUnreadNotifications(
      user.uid,
      (rows) => {
        void syncAppBadge(rows.length);
      },
      () => undefined,
    );
  }, [user]);
}
