"use client";

import type { Task } from "@/core/types";

export function PriorityList({
  tasks,
  onToggle,
  onPlan,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onPlan: () => void;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] text-ink-muted">Priorities</p>
        <button type="button" onClick={onPlan} className="text-[13px] text-accent active:opacity-70">
          Plan
        </button>
      </div>
      {tasks.length === 0 ? (
        <button
          type="button"
          onClick={onPlan}
          className="mt-3 w-full text-left text-[16px] text-ink-muted active:opacity-70"
        >
          Choose the three things that matter today.
        </button>
      ) : (
        <ol className="mt-1">
          {tasks.map((task, index) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onToggle(task)}
                className="flex w-full items-baseline gap-3 py-3 text-left active:opacity-70"
              >
                <span className="font-serif tabular w-5 text-[18px] text-accent/80">{index + 1}</span>
                <span
                  className={`flex-1 text-[17px] leading-snug ${
                    task.completed ? "text-ink-muted line-through decoration-hairline" : "text-ink"
                  }`}
                >
                  {task.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
