"use client";

import type { Task } from "@/core/types";

export function PriorityList({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
}) {
  return (
    <section>
      <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        Priorities
      </p>
      {tasks.length === 0 ? (
        <p className="mt-3 text-[15px] text-ink-muted">No top three yet.</p>
      ) : (
        <ol className="mt-1">
          {tasks.map((task, index) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onToggle(task)}
                className="flex w-full items-baseline gap-4 border-t border-hairline py-3.5 text-left active:opacity-70"
              >
                <span className="tabular w-4 text-[13px] text-accent">{index + 1}</span>
                <span
                  className={`flex-1 text-[17px] ${
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
