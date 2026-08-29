"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Habit, HabitEntry } from "@/core/types";

export function HabitRow({
  habit,
  entry,
  onTap,
}: {
  habit: Habit;
  entry: HabitEntry | null;
  onTap: () => void;
}) {
  const reduce = useReducedMotion();
  const count = entry?.count ?? 0;
  const done = entry?.completed ?? false;
  const marks = Math.max(1, habit.targetCount);

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center justify-between gap-4 border-t border-hairline py-3.5 text-left active:opacity-70"
    >
      <span className={`text-[17px] ${done ? "text-ink-muted line-through decoration-hairline" : "text-ink"}`}>
        {habit.name}
      </span>
      <span className="flex items-center gap-1.5">
        {Array.from({ length: marks }, (_, index) => {
          const filled = index < count;
          return (
            <motion.span
              key={index}
              className={`block h-2 w-2 rounded-full ${filled ? "bg-accent" : "bg-hairline"}`}
              animate={filled && !reduce ? { scale: [0.75, 1] } : undefined}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </span>
    </button>
  );
}
