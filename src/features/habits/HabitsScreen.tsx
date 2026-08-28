"use client";

import { useState } from "react";
import { createHabitSchema } from "@/core/schemas/waveB";
import type { Habit, HabitTargetCount } from "@/core/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { createHabit, removeHabit, updateHabit } from "@/services/habitService";

export function HabitsScreen({
  userId,
  habits,
}: {
  userId: string;
  habits: Habit[];
}) {
  const [name, setName] = useState("");
  const [targetCount, setTargetCount] = useState<HabitTargetCount>(1);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    try {
      const parsed = createHabitSchema.parse({ name, targetCount });
      await createHabit({
        userId,
        name: parsed.name,
        targetCount: parsed.targetCount,
        sortOrder: habits.length,
      });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add habit");
    }
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-bronze uppercase">Habits</p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight">Keep them few.</h1>
      {habits.length === 0 ? (
        <EmptyState title="No habits" body="Add one below. There are no sample streaks." />
      ) : (
        <ul className="mt-6">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center justify-between border-t border-hairline py-3">
              <div>
                <p className="text-ivory">{habit.name}</p>
                <p className="text-xs text-mute">{habit.targetCount} tap complete</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="text-xs text-mute"
                  onClick={() =>
                    void updateHabit({
                      ...habit,
                      targetCount: nextTarget(habit.targetCount),
                    })
                  }
                >
                  Target
                </button>
                <button
                  type="button"
                  className="text-xs text-danger"
                  onClick={() => void removeHabit(userId, habit.id)}
                >
                  Archive
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex flex-col gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New habit"
          className="border-b border-hairline bg-transparent py-2 text-ivory outline-none placeholder:text-mute"
        />
        <div className="flex gap-3">
          {([1, 2, 3] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setTargetCount(count)}
              className={`text-sm ${targetCount === count ? "text-bronze" : "text-mute"}`}
            >
              {count}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button type="button" onClick={() => void add()} className="text-left text-bronze">
          Add habit
        </button>
      </div>
    </div>
  );
}

function nextTarget(current: HabitTargetCount): HabitTargetCount {
  if (current === 1) return 2;
  if (current === 2) return 3;
  return 1;
}
