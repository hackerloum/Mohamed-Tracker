"use client";

import { useMemo, useState } from "react";
import type { Habit, Task } from "@/core/types";
import { Sheet } from "@/components/ui/Sheet";
import { createTask } from "@/services/taskService";
import { saveDailyPlan } from "@/services/dayService";
import { useUiStore } from "@/stores/uiStore";
import type { TodayData } from "@/hooks/useTodayData";

export function PlanMyDaySheet({
  userId,
  data,
}: {
  userId: string;
  data: TodayData;
}) {
  const open = useUiStore((state) => state.planSheetOpen);
  const close = useUiStore((state) => state.closePlanSheet);
  const [selected, setSelected] = useState<string[]>(data.day?.priorityTaskIds ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planHabit: Habit | null = useMemo(
    () => data.habits.find((habit) => habit.name === "Plan My Day") ?? null,
    [data.habits],
  );

  async function addTask() {
    const title = draft.trim();
    if (!title) return;
    setError(null);
    try {
      const task = await createTask({
        userId,
        title,
        localDate: data.localDate,
        timezone: data.timezone,
        priority: true,
      });
      setSelected((current) => [...current, task.id].slice(0, 3));
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add task");
    }
  }

  function toggle(task: Task) {
    setSelected((current) => {
      if (current.includes(task.id)) return current.filter((id) => id !== task.id);
      if (current.length >= 3) return current;
      return [...current, task.id];
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const planEntry =
        data.entries.find((entry) => entry.habitId === planHabit?.id) ?? null;
      await saveDailyPlan({
        userId,
        localDate: data.localDate,
        timezone: data.timezone,
        existing: data.day,
        priorityTaskIds: selected,
        planHabit,
        planEntry,
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? close() : undefined)} title="Plan my day">
      <p className="text-sm text-mute">Choose up to three priorities. Empty is honest — don’t invent work.</p>
      <ul className="mt-4">
        {data.tasks.map((task) => {
          const on = selected.includes(task.id);
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggle(task)}
                className="flex w-full items-center justify-between border-t border-hairline py-3 text-left"
              >
                <span className="text-ivory">{task.title}</span>
                <span className="text-[11px] tracking-wide text-bronze uppercase">
                  {on ? "Chosen" : "Add"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {data.tasks.length === 0 ? (
        <p className="border-t border-hairline py-3 text-sm text-mute">No tasks for today yet.</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="New priority"
          className="flex-1 border-b border-hairline bg-transparent py-2 text-ivory outline-none placeholder:text-mute"
        />
        <button type="button" onClick={() => void addTask()} className="text-sm text-bronze">
          Add
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-6 w-full border-b border-bronze py-3 text-left text-bronze"
      >
        {saving ? "Saving…" : "Save plan"}
      </button>
    </Sheet>
  );
}
