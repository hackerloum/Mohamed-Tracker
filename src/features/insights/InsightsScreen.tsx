"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  CompareLine,
  InsightBars,
  InsightSection,
  InsightTrend,
  moneyLabel,
} from "@/components/insights/visuals";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import type { InsightsRange } from "@/core/engines/insights";
import { formatTzs } from "@/core/money/integer";
import { useInsights } from "@/hooks/use-insights";

const PERIODS: { id: InsightsRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export function InsightsScreen() {
  const [range, setRange] = useState<InsightsRange>("week");
  const { bundle, loading, error } = useInsights(range);
  const current = bundle?.current;
  const deltas = bundle?.deltas ?? [];
  const delta = (metric: string) => deltas.find((row) => row.metric === metric);

  return (
    <Screen>
      <AppHeader title="Insights" />
      <nav className="mb-5 flex gap-5 text-[14px] text-ink-muted">
        <Link href="/insights/week" className="hover:text-ink">
          Review
        </Link>
        <Link href="/insights/calendar" className="hover:text-ink">
          Calendar
        </Link>
      </nav>
      <div className="mb-6 flex gap-1 rounded-full bg-bg-raised p-1">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRange(item.id)}
            className={`flex-1 rounded-full py-1.5 text-[13px] ${
              range === item.id ? "bg-bg-overlay text-ink" : "text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-[14px] text-ink-muted">Reading stored days…</p>
      ) : !current || !current.hasAnyData ? (
        <EmptyState
          title="No insight data yet."
          detail="Charts stay empty until habits, money, and study sessions exist. This screen will not invent numbers."
        />
      ) : (
        <>
          <InsightSection
            title="Habits"
            empty={current.habitCompletion.percent === null ? "No habits to score in this period." : undefined}
          >
            {current.habitCompletion.percent !== null ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.habitCompletion.percent}%
                </p>
                <p className="mt-2 text-[14px] text-ink-muted">
                  {current.habitCompletion.completedSlots} of {current.habitCompletion.expectedSlots}{" "}
                  completions
                </p>
                <InsightBars daily={current.habitCompletion.daily} />
                <CompareLine delta={delta("habitPercent")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Prayer"
            empty={
              current.prayerConsistency.percent === null
                ? "No prayers logged in this period."
                : undefined
            }
          >
            {current.prayerConsistency.percent !== null ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.prayerConsistency.percent}%
                </p>
                <p className="mt-2 text-[14px] text-ink-muted">
                  {current.prayerConsistency.completed} of {current.prayerConsistency.expected}{" "}
                  canonical prayers
                </p>
                <InsightBars daily={current.prayerConsistency.daily} />
                <CompareLine delta={delta("prayers")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Workouts"
            empty={current.workoutFrequency.count === 0 ? "No workouts logged." : undefined}
          >
            {current.workoutFrequency.count > 0 ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.workoutFrequency.count}
                </p>
                <InsightBars daily={current.workoutFrequency.daily} />
                <CompareLine delta={delta("workouts")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Study"
            empty={current.studyHours.minutes === 0 ? "No study sessions in this period." : undefined}
          >
            {current.studyHours.minutes > 0 ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.studyHours.hours}
                  <span className="ml-2 text-[14px] font-sans text-ink-muted">hours</span>
                </p>
                <InsightTrend daily={current.studyHours.daily} />
                <CompareLine delta={delta("studyMinutes")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Money"
            empty={
              current.expenses.spent === 0 && current.expenses.earned === 0
                ? "No transactions in this period."
                : undefined
            }
          >
            {current.expenses.spent > 0 || current.expenses.earned > 0 ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {formatTzs(current.expenses.spent, { withCode: true })}
                </p>
                <p className="mt-2 text-[14px] text-ink-muted">
                  Income {formatTzs(current.expenses.earned, { withCode: true })}
                </p>
                <InsightTrend daily={current.expenses.daily} format={moneyLabel} />
                <CompareLine delta={delta("spent")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Daily score"
            empty={current.dailyScores.average === null ? "No stored daily scores yet." : undefined}
          >
            {current.dailyScores.average !== null ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.dailyScores.average}
                </p>
                <InsightTrend daily={current.dailyScores.daily} />
                <CompareLine delta={delta("score")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Goals"
            empty={current.goalProgress.length === 0 ? "No goals to show." : undefined}
          >
            {current.goalProgress.length > 0 ? (
              <ul className="space-y-2">
                {current.goalProgress.map((goal) => (
                  <li key={goal.id} className="flex justify-between text-[15px]">
                    <span>{goal.title}</span>
                    <span className="font-mono tabular-nums text-ink-muted">{goal.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Mood"
            empty={current.mood.average === null ? "No mood check-ins in this period." : undefined}
          >
            {current.mood.average !== null ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {current.mood.average}
                  <span className="ml-2 text-[14px] font-sans text-ink-muted">/ 5</span>
                </p>
                <InsightBars daily={current.mood.daily} />
                <CompareLine delta={delta("mood")} />
              </>
            ) : null}
          </InsightSection>

          <InsightSection
            title="Sleep"
            empty={
              current.sleep.averageMinutes === null ? "No sleep logs in this period." : undefined
            }
          >
            {current.sleep.averageMinutes !== null ? (
              <>
                <p className="font-mono text-[32px] tabular-nums leading-none">
                  {Math.round((current.sleep.averageMinutes / 60) * 10) / 10}
                  <span className="ml-2 text-[14px] font-sans text-ink-muted">hours avg</span>
                </p>
                {current.sleep.averageQuality !== null ? (
                  <p className="mt-2 text-[14px] text-ink-muted">
                    Quality {current.sleep.averageQuality}/5
                  </p>
                ) : null}
                <InsightTrend daily={current.sleep.daily} />
                <CompareLine delta={delta("sleepMinutes")} />
              </>
            ) : null}
          </InsightSection>
        </>
      )}
    </Screen>
  );
}
