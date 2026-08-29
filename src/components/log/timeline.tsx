"use client";

import { format, parseISO } from "date-fns";
import type { Activity } from "@/core/types/activity";

export function Timeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="pt-8 text-[16px] text-ink-muted">Nothing logged for this day.</p>;
  }

  return (
    <ol className="relative">
      <span className="absolute top-2 bottom-2 left-[19px] w-px bg-hairline" aria-hidden />
      {activities.map((activity) => (
        <li key={activity.id} className="relative flex gap-4 py-3.5 pl-1">
          <span className="relative z-[1] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
          <div className="min-w-0">
            <p className="tabular text-[12px] text-ink-muted">{formatTime(activity.occurredAt)}</p>
            <p className="mt-0.5 text-[17px] leading-snug text-ink">{activity.title}</p>
            {activity.summary && activity.summary !== activity.title ? (
              <p className="mt-0.5 text-[13px] text-ink-muted">{activity.summary}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function formatTime(iso: string): string {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
}
