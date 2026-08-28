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

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center justify-between border-t border-hairline py-3 text-left"
    >
      <span className={done ? "text-mute line-through" : "text-ivory"}>{habit.name}</span>
      <span className="flex items-center gap-1.5">
        {Array.from({ length: habit.targetCount }, (_, index) => {
          const filled = index < count;
          return (
            <motion.span
              key={index}
              className={`h-2.5 w-2.5 rounded-full ${filled ? "bg-bronze" : "bg-hairline"}`}
              animate={filled && !reduce ? { scale: [0.85, 1] } : undefined}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </span>
    </button>
  );
}
