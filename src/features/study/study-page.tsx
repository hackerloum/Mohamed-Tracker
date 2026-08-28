"use client";

import Link from "next/link";
import { addLocalDays, todayLocalDate } from "@/core/dates/localDate";
import { computeStudyAnalytics } from "@/core/study/analytics";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAppSession } from "@/components/layout/AppShell";
import { useStudySessions } from "@/hooks/use-study-sessions";

export function StudyPage() {
  const { userId, timezone } = useAppSession();
  const today = todayLocalDate(timezone);
  const sessions = useStudySessions(userId, addLocalDays(today, -366), today);
  const stats = computeStudyAnalytics(sessions, today);
  const recent = [...sessions].sort((a, b) => b.endedAt.localeCompare(a.endedAt)).slice(0, 12);

  return (
    <main>
      <AppHeader
        title="Study"
        action={
          <Link
            href="/study/start"
            className="rounded-full bg-accent px-4 py-2.5 text-sm tracking-wide text-accent-ink"
          >
            Start study
          </Link>
        }
      />
      <section className="px-5 pb-6">
        <StatLine label="Today" value={minutesLabel(stats.todayMinutes)} />
        <StatLine label="This week" value={minutesLabel(stats.weekMinutes)} />
        <StatLine label="This month" value={minutesLabel(stats.monthMinutes)} />
        <StatLine label="Streak" value={`${stats.streakDays}d`} />
        <StatLine label="Average" value={minutesLabel(stats.averageSessionMinutes)} />
        <StatLine label="Total" value={`${formatHours(stats.totalHours)} h`} />
      </section>
      {stats.topTopics.length > 0 ? (
        <section className="px-5 pb-6">
          <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-ink-muted">Top topics</h2>
          <ul>
            {stats.topTopics.slice(0, 5).map((row) => (
              <li key={row.topic} className="flex justify-between border-t border-hairline py-2 text-sm">
                <span>{row.topic}</span>
                <span className="tabular text-ink-muted">{minutesLabel(row.minutes)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="px-5 pb-8">
        <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-ink-muted">Recent</h2>
        {recent.length === 0 ? (
          <p className="text-ink-muted">No sessions yet. Start the timer when you sit down.</p>
        ) : (
          <ul>
            {recent.map((session) => (
              <li key={session.id} className="border-t border-hairline py-3">
                <p className="text-base">{session.topic}</p>
                <p className="tabular text-sm text-ink-muted">
                  {session.localDate} Â· {minutesLabel(session.durationMinutes)}
                  {session.notes ? ` Â· ${session.notes}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline py-3">
      <span className="text-ink-muted">{label}</span>
      <span className="tabular text-2xl tracking-tight">{value}</span>
    </div>
  );
}

function minutesLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}
