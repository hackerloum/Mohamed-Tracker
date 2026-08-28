"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TIMEZONE } from "@/core/defaults/onboarding";
import { localDateFrom } from "@/core/dates/localDate";
import type {
  DayRecord,
  Habit,
  HabitEntry,
  Note,
  PrayerEntry,
  Task,
  UserProfile,
} from "@/core/types";
import { subscribeDay } from "@/repositories/days";
import { subscribeHabitEntriesForDate } from "@/repositories/habitEntries";
import { subscribeHabits } from "@/repositories/habits";
import { subscribeNotesForDate } from "@/repositories/notes";
import { subscribePrayerEntriesForDate } from "@/repositories/prayers";
import { subscribeTasksForDate } from "@/repositories/tasks";
import { subscribeProfile } from "@/repositories/users";

export interface TodayData {
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  localDate: string;
  timezone: string;
  habits: Habit[];
  entries: HabitEntry[];
  prayers: PrayerEntry[];
  day: DayRecord | null;
  tasks: Task[];
  notes: Note[];
}

export function useTodayData(userId: string | null): TodayData {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [day, setDay] = useState<DayRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  const timezone = profile?.timezone ?? DEFAULT_TIMEZONE;
  const localDate = useMemo(
    () => localDateFrom(new Date(), timezone),
    [timezone],
  );

  useEffect(() => {
    if (!userId) return;
    const unsubscribers = [
      subscribeProfile(userId, setProfile, (err) => setError(err.message)),
      subscribeHabits(userId, setHabits, (err) => setError(err.message)),
      subscribeHabitEntriesForDate(userId, localDate, setEntries, (err) =>
        setError(err.message),
      ),
      subscribePrayerEntriesForDate(userId, localDate, setPrayers, (err) =>
        setError(err.message),
      ),
      subscribeDay(userId, localDate, setDay, (err) => setError(err.message)),
      subscribeTasksForDate(userId, localDate, setTasks, (err) =>
        setError(err.message),
      ),
      subscribeNotesForDate(userId, localDate, setNotes, (err) =>
        setError(err.message),
      ),
    ];
    return () => {
      for (const stop of unsubscribers) stop();
    };
  }, [localDate, userId]);

  if (!userId) {
    return {
      loading: false,
      error: null,
      profile: null,
      localDate,
      timezone,
      habits: [],
      entries: [],
      prayers: [],
      day: null,
      tasks: [],
      notes: [],
    };
  }

  return {
    loading: false,
    error,
    profile,
    localDate,
    timezone,
    habits,
    entries,
    prayers,
    day,
    tasks,
    notes,
  };
}
