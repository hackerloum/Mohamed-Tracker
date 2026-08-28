"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { computeDailyScore } from "@/core/engines/dailyScore";
import { nextAction, type NextAction } from "@/core/engines/nextAction";
import { localHourFrom } from "@/core/dates/localDate";
import { CANONICAL_PRAYERS, type HabitEntry, type PrayerKey } from "@/core/types";
import { DayDial } from "@/components/today/DayDial";
import { HabitRow } from "@/components/today/HabitRow";
import { PrayerStrip } from "@/components/today/PrayerStrip";
import { PriorityList } from "@/components/today/PriorityList";
import { UpNext } from "@/components/today/UpNext";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanMyDaySheet } from "@/features/today/PlanMyDaySheet";
import { PrayerDetailSheet } from "@/features/today/PrayerDetailSheet";
import { useTodayData } from "@/hooks/useTodayData";
import { useAuth } from "@/hooks/useAuth";
import { cacheDayScore } from "@/services/dayService";
import { completeHabitTap, nextHabitEntry } from "@/services/habitService";
import { completePrayer } from "@/services/prayerService";
import { toggleTaskComplete } from "@/services/taskService";
import { useUiStore } from "@/stores/uiStore";

export function TodayScreen(props: { userId?: string }) {
  const auth = useAuth();
  const userId = props.userId ?? auth.user?.uid ?? "";
  const data = useTodayData(userId || null);
  const openPlan = useUiStore((state) => state.openPlanSheet);
  const openPrayerDetail = useUiStore((state) => state.openPrayerDetail);
  const [optimistic, setOptimistic] = useState<Record<string, HabitEntry>>({});

  const entriesByHabit = useMemo(() => {
    const map = new Map<string, HabitEntry>();
    for (const entry of data.entries) map.set(entry.habitId, entry);
    for (const [habitId, entry] of Object.entries(optimistic)) {
      const live = map.get(habitId);
      if (!live || entry.count >= live.count) map.set(habitId, entry);
    }
    return map;
  }, [data.entries, optimistic]);

  const completedPrayers = useMemo(() => {
    const keys = new Set<PrayerKey>();
    for (const entry of data.prayers) {
      if (entry.completed) keys.add(entry.prayerKey);
    }
    return keys;
  }, [data.prayers]);

  const score = useMemo(
    () =>
      computeDailyScore({
        habits: data.habits.map((habit) => ({
          count: entriesByHabit.get(habit.id)?.count ?? 0,
          targetCount: habit.targetCount,
        })),
        prayersCompleted: CANONICAL_PRAYERS.filter((key) => completedPrayers.has(key)).length,
        prayerTotal: data.habits.length > 0 || data.prayers.length > 0 || Boolean(data.day)
          ? 5
          : 0,
        planned: Boolean(data.day?.planned),
        includePlan: data.habits.length > 0 || Boolean(data.day),
        tasksCompleted: data.tasks.filter((task) => task.completed).length,
        tasksTotal: data.tasks.length,
        weights: data.profile?.scoreWeights,
      }),
    [completedPrayers, data.day, data.habits, data.prayers.length, data.profile?.scoreWeights, data.tasks, entriesByHabit],
  );

  const action = useMemo(
    () =>
      nextAction({
        nowHour: localHourFrom(new Date(), data.timezone),
        planned: Boolean(data.day?.planned),
        prayers: CANONICAL_PRAYERS.map((key) => ({
          key,
          completed: completedPrayers.has(key),
        })),
        habits: data.habits.map((habit) => ({
          id: habit.id,
          name: habit.name,
          completed: entriesByHabit.get(habit.id)?.completed ?? false,
          sortOrder: habit.sortOrder,
        })),
        tasks: data.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          priority: task.priority || Boolean(data.day?.priorityTaskIds.includes(task.id)),
        })),
      }),
    [completedPrayers, data.day, data.habits, data.tasks, data.timezone, entriesByHabit],
  );

  const priorities = useMemo(() => {
    if (data.day?.priorityTaskIds.length) {
      return data.day.priorityTaskIds
        .map((id) => data.tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task));
    }
    return data.tasks.filter((task) => task.priority);
  }, [data.day, data.tasks]);

  useEffect(() => {
    if (score.score === data.day?.cachedScore) return;
    const handle = window.setTimeout(() => {
      void cacheDayScore({
        userId,
        localDate: data.localDate,
        timezone: data.timezone,
        existing: data.day,
        score: score.score,
      });
    }, 900);
    return () => window.clearTimeout(handle);
  }, [data.day, data.localDate, data.timezone, score.score, userId]);

  async function tapHabit(habitId: string) {
    const habit = data.habits.find((item) => item.id === habitId);
    if (!habit) return;
    const existing = entriesByHabit.get(habit.id) ?? null;
    const next = nextHabitEntry(habit, existing, data.localDate, data.timezone);
    setOptimistic((current) => ({ ...current, [habit.id]: next }));
    try {
      await completeHabitTap({
        habit,
        existing,
        localDate: data.localDate,
        timezone: data.timezone,
      });
    } catch {
      setOptimistic((current) => {
        const copy = { ...current };
        delete copy[habit.id];
        return copy;
      });
    }
  }

  async function tapPrayer(key: PrayerKey) {
    const existing = data.prayers.find((entry) => entry.prayerKey === key) ?? null;
    if (existing?.completed) return;
    await completePrayer({
      userId,
      prayerKey: key,
      existing,
      localDate: data.localDate,
      timezone: data.timezone,
    });
  }

  async function handleUpNext(next: NextAction) {
    if (next.kind === "plan") {
      openPlan();
      return;
    }
    if (next.kind === "prayer") {
      await tapPrayer(next.key);
      return;
    }
    if (next.kind === "habit") {
      await tapHabit(next.habitId);
      return;
    }
    const task = data.tasks.find((item) => item.id === next.taskId);
    if (task) await toggleTaskComplete(task);
  }

  const now = new Date();
  const weekday = formatInTimeZone(now, data.timezone, "EEEE");
  const dateLabel = formatInTimeZone(now, data.timezone, "d MMM");

  if (data.error) {
    return (
      <EmptyState title="Could not load today" body={data.error} />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex items-baseline justify-between">
        <p className="text-[11px] tracking-[0.22em] text-bronze uppercase">Today</p>
        <button type="button" onClick={openPlan} className="text-sm text-mute">
          Plan my day
        </button>
      </header>

      <DayDial score={score.score} dateLabel={dateLabel} weekday={weekday} />

      <PrayerStrip
        completedKeys={completedPrayers}
        extrasEnabled={Boolean(data.profile?.prayer.extrasEnabled)}
        onTap={(key) => void tapPrayer(key)}
        onLongPress={openPrayerDetail}
      />

      <UpNext action={action} onAct={(item) => void handleUpNext(item)} />

      <PriorityList
        tasks={priorities}
        onToggle={(task) => void toggleTaskComplete(task)}
      />

      <section>
        <p className="text-[11px] tracking-[0.18em] text-mute uppercase">Habits</p>
        {data.habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            body="Add one from Quick add, or finish onboarding to seed the defaults."
          />
        ) : (
          data.habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              entry={entriesByHabit.get(habit.id) ?? null}
              onTap={() => void tapHabit(habit.id)}
            />
          ))
        )}
      </section>

      <PlanMyDaySheet userId={userId} data={data} />
      <PrayerDetailSheet
        userId={userId}
        localDate={data.localDate}
        timezone={data.timezone}
        entries={data.prayers}
      />
    </div>
  );
}
