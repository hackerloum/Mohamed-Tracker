"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hairline } from "@/components/ui/Hairline";
import { Screen } from "@/components/ui/Screen";
import { Sheet } from "@/components/ui/Sheet";
import { startOfMonthDate, todayLocalDate } from "@/core/dates/localDate";
import { formatTzs } from "@/core/money/integer";
import { PRAYER_LABELS } from "@/core/types/body";
import { useAuth } from "@/hooks/useAuth";
import { useCalendarMonth, useDayHistory } from "@/hooks/use-insights";
import type { CalendarDayTone } from "@/core/calendar/month";
import type { DayHistory } from "@/services/insights";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shiftMonth(monthStart: string, delta: number): string {
  const year = Number.parseInt(monthStart.slice(0, 4), 10);
  const month = Number.parseInt(monthStart.slice(5, 7), 10);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function toneClass(tone: CalendarDayTone, inMonth: boolean): string {
  const faded = inMonth ? "" : "opacity-30";
  if (tone === "completed") return `bg-accent text-accent-ink ${faded}`;
  if (tone === "strong") return `bg-accent/40 text-ink ${faded}`;
  if (tone === "low") return `bg-danger/20 text-ink ${faded}`;
  return `bg-transparent text-ink ${faded}`;
}

function monthHeading(monthStart: string): string {
  const date = new Date(`${monthStart}T12:00:00.000Z`);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function CalendarScreen() {
  const { profile } = useAuth();
  const timezone = profile?.timezone ?? "Africa/Dar_es_Salaam";
  const [monthStart, setMonthStart] = useState(() => startOfMonthDate(todayLocalDate(timezone)));
  const [selected, setSelected] = useState<string | null>(null);
  const { cells, loading, error } = useCalendarMonth(monthStart);
  const { history, loading: historyLoading } = useDayHistory(selected);
  const hasHistory = cells.some((cell) => cell.inMonth && (cell.score !== null || cell.spend > 0));

  const weeks = useMemo(() => {
    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cells]);

  return (
    <Screen>
      <AppHeader title="Calendar" />
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonthStart((value) => shiftMonth(value, -1))}
          className="p-2 text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-[15px] text-ink">{monthHeading(monthStart)}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonthStart((value) => shiftMonth(value, 1))}
          className="p-2 text-ink-muted hover:text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <Hairline accent />

      {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-[14px] text-ink-muted">Loading month…</p>
      ) : !hasHistory ? (
        <EmptyState
          title="No history to plot."
          detail="A heatmap appears once days have stored scores or spending."
        />
      ) : (
        <div className="mt-5">
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="space-y-1">
            {weeks.map((week) => (
              <div key={week[0]?.localDate} className="grid grid-cols-7 gap-1">
                {week.map((cell) => (
                  <button
                    key={cell.localDate}
                    type="button"
                    onClick={() => setSelected(cell.localDate)}
                    className={`relative flex h-11 items-start justify-center rounded-sm pt-1.5 text-[13px] tabular-nums ${toneClass(cell.tone, cell.inMonth)}`}
                  >
                    {cell.localDate.slice(8)}
                    {cell.spendIntensity > 0 ? (
                      <span
                        className="absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-accent"
                        style={{ width: `${Math.max(20, cell.spendIntensity * 70)}%` }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-ink-muted">
            Bronze fill is a strong or completed day. A thin mark is spending intensity. Tap a date for that day’s log.
          </p>
        </div>
      )}

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={history?.heading ?? selected ?? "Day"}
      >
        {historyLoading || !history ? (
          <p className="text-sm text-ink-muted">Opening that day…</p>
        ) : (
          <DayHistoryBody history={history} />
        )}
      </Sheet>
    </Screen>
  );
}

function DayHistoryBody({ history }: { history: DayHistory }) {
  return (
    <div className="space-y-5 text-[15px]">
      <p className="text-ink-muted">
        {history.planned ? "Day was planned." : "Day was not planned."}
        {history.score !== null ? ` Score ${history.score}.` : " No stored score."}
      </p>
      <HistoryBlock
        title="Habits"
        empty="No habits for this day."
        items={history.habits.map(
          (habit) => `${habit.name} · ${habit.completed ? "done" : `${habit.count}/${habit.targetCount}`}`,
        )}
      />
      <HistoryBlock
        title="Prayers"
        empty="No prayers logged."
        items={history.prayers.map(
          (prayer) =>
            `${PRAYER_LABELS[prayer.prayerKey] ?? prayer.prayerKey} · ${prayer.completed ? "logged" : "open"}`,
        )}
      />
      <HistoryBlock
        title="Spending"
        empty="No transactions."
        items={history.transactions.map(
          (row) => `${row.type} · ${formatTzs(row.amount, { withCode: true })}${row.note ? ` · ${row.note}` : ""}`,
        )}
      />
      <HistoryBlock
        title="Study"
        empty="No study sessions."
        items={history.study.map((row) => `${row.topic || "Study"} · ${row.durationMinutes} min`)}
      />
      <HistoryBlock
        title="Workouts"
        empty="No workouts."
        items={history.workouts.map((row) => `${row.type} · ${row.durationMinutes} min`)}
      />
      <HistoryBlock
        title="Tasks"
        empty="No tasks."
        items={history.tasks.map((row) => `${row.title}${row.completed ? " · done" : ""}`)}
      />
      <HistoryBlock
        title="Notes"
        empty="No notes."
        items={history.notes.map((row) => row.body)}
      />
      <HistoryBlock
        title="Timeline"
        empty="No activities."
        items={history.activities.map((row) => `${row.title}`)}
      />
      {history.reflection ? (
        <div>
          <h3 className="mb-1 text-[12px] uppercase tracking-[0.16em] text-ink-muted">Reflection</h3>
          <p>{history.reflection.wentWell ?? history.reflection.mainWin ?? "Reflection saved."}</p>
        </div>
      ) : (
        <p className="text-ink-muted">No reflection.</p>
      )}
      {history.checkin?.mood ? (
        <p>Mood {history.checkin.mood}/5</p>
      ) : (
        <p className="text-ink-muted">No mood check-in.</p>
      )}
      {history.sleep ? (
        <p>
          Sleep {Math.round((history.sleep.durationMinutes / 60) * 10) / 10} hours · quality{" "}
          {history.sleep.quality}/5
        </p>
      ) : (
        <p className="text-ink-muted">No sleep log.</p>
      )}
    </div>
  );
}

function HistoryBlock({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="mb-1 text-[12px] uppercase tracking-[0.16em] text-ink-muted">{title}</h3>
      {items.length === 0 ? (
        <p className="text-ink-muted">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={`${title}-${item}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
