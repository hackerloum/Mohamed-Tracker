"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hairline } from "@/components/ui/Hairline";
import { Screen } from "@/components/ui/Screen";
import { useWeeklyReview } from "@/hooks/use-insights";

export function WeekReviewScreen() {
  const { review, loading, error } = useWeeklyReview();
  const observations = review?.observations ?? [];

  return (
    <Screen>
      <AppHeader
        title="This week"
        trailing={
          <Link href="/insights" className="text-sm text-ink-muted">
            Insights
          </Link>
        }
      />
      <Hairline accent />
      {error ? <p className="mt-4 text-[14px] text-danger">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-[14px] text-ink-muted">Comparing this week to last week…</p>
      ) : observations.length === 0 ? (
        <EmptyState
          title="Not enough stored data to review this week."
          detail="Observations appear only from real week-over-week diffs. Nothing is invented."
        />
      ) : (
        <ol className="mt-6 space-y-5">
          {observations.map((line) => (
            <li key={line} className="text-[17px] leading-relaxed text-ink">
              {line}
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}
