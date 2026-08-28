"use client";

import type { Task } from "@/core/types";
import { EmptyState } from "@/components/ui/EmptyState";

export function PriorityList({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
}) {
  return (
    <section>
      <p className="text-[11px] tracking-[0.18em] text-mute uppercase">Priorities</p>
      {tasks.length === 0 ? (
        <EmptyState
          title="No priorities yet"
          body="Open Plan my day to choose up to three."
        />
      ) : (
        <ul className="mt-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onToggle(task)}
                className="flex w-full items-center justify-between border-t border-hairline py-3 text-left"
              >
                <span className={task.completed ? "text-mute line-through" : "text-ivory"}>
                  {task.title}
                </span>
                <span className="text-[11px] tracking-wide text-bronze uppercase">
                  {task.completed ? "Done" : "Open"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
