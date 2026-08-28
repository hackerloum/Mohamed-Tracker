"use client";

import { useEffect, useState } from "react";
import { DEFAULT_TIMEZONE, todayLocalDate } from "@/core/dates/localDate";
import type { InsightsRange } from "@/core/engines/insights";
import { useAuth } from "@/hooks/useAuth";
import {
  loadCalendarMonth,
  loadDayHistory,
  loadInsightsBundle,
  loadWeeklyReview,
  searchLife,
  type DayHistory,
  type InsightsBundle,
} from "@/services/insights";
import { useMoneyCatalog } from "@/hooks/use-money-catalog";
import type { CalendarDayCell } from "@/core/calendar/month";
import type { WeeklyReview } from "@/core/engines/weeklyReview";
import type { SearchDocument } from "@/core/search/search";

export function useInsights(range: InsightsRange) {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const [bundle, setBundle] = useState<InsightsBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void loadInsightsBundle(user.uid, range, new Date(), timezone)
      .then((next) => {
        if (!cancelled) {
          setBundle(next);
          setError(null);
          setVersion((value) => value + 1);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load insights.");
          setVersion((value) => value + 1);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [range, timezone, user]);

  return {
    bundle,
    loading: Boolean(user) && version === 0 && error === null && bundle === null,
    error,
    timezone,
  };
}

export function useWeeklyReview() {
  const { user, profile } = useAuth();
  const { categories } = useMoneyCatalog();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const names = new Map(categories.map((row) => [row.id, row.name]));
    let cancelled = false;
    void loadWeeklyReview(user.uid, new Date(), timezone, names)
      .then((next) => {
        if (!cancelled) {
          setReview(next);
          setError(null);
          setLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load this week.");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [categories, timezone, user]);

  return { review, loading: Boolean(user) && !loaded, error };
}

export function useCalendarMonth(monthStart: string) {
  const { user } = useAuth();
  const [cells, setCells] = useState<CalendarDayCell[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void loadCalendarMonth(user.uid, monthStart)
      .then((next) => {
        if (!cancelled) {
          setCells(next);
          setError(null);
          setLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the calendar.");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [monthStart, user]);

  return { cells, loading: Boolean(user) && !loaded, error };
}

export function useDayHistory(localDate: string | null) {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const [history, setHistory] = useState<DayHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !localDate) return;
    let cancelled = false;
    void loadDayHistory(user.uid, localDate, timezone)
      .then((next) => {
        if (!cancelled) {
          setHistory(next);
          setError(null);
          setLoadedFor(localDate);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load that day.");
          setLoadedFor(localDate);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [localDate, timezone, user]);

  return {
    history: localDate ? history : null,
    loading: Boolean(user && localDate && loadedFor !== localDate),
    error,
  };
}

export function useLifeSearch(query: string) {
  const { user, profile } = useAuth();
  const today = todayLocalDate(profile?.timezone ?? DEFAULT_TIMEZONE);
  const trimmed = query.trim();
  const [hits, setHits] = useState<SearchDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user || !trimmed) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setPending(true);
      void searchLife(user.uid, trimmed, today)
        .then((next) => {
          if (!cancelled) {
            setHits(next);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Search failed.");
          }
        })
        .finally(() => {
          if (!cancelled) setPending(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, today, user]);

  return {
    hits: trimmed ? hits : [],
    loading: Boolean(trimmed) && pending,
    error,
  };
}
