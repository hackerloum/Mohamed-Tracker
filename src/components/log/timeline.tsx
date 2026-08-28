"use client";

import { format, parseISO } from "date-fns";
import type { Activity } from "@/core/types/activity";

const TYPE_LABEL: Record<Activity["type"], string> = {
  habit: "Habit",
  prayer: "Prayer",
  task: "Task",
  note: "Note",
  study: "Study",
  workout: "Workout",
  expense: "Expense",
  income: "Income",
  mood: "Mood",
  sleep: "Sleep",
  activity: "Activity",
  custom: "Custom",
  goal: "Goal",
  reflection: "Reflection",
  checkin: "Check-in",
};

export function Timeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="px-5 pt-10 text-ink-muted">
        Nothing logged for this day. Use + to add something.
      </p>
    );
  }

  return (
    <ol className="px-5">
      {activities.map((activity) => (
        <li key={activity.id} className="border-t border-hairline py-4 first:border-t-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            {TYPE_LABEL[activity.type]}
            <span className="tabular ml-2 normal-case tracking-normal">
              {formatTime(activity.occurredAt)}
            </span>
          </p>
          <p className="mt-1 text-lg leading-snug">{activity.title}</p>
        </li>
      ))}
    </ol>
  );
}

function formatTime(iso: string): string {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return format(date, "HH:mm");
}
