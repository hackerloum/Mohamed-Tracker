"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { DateNavigator } from "@/components/layout/DateNavigator";
import { useAppSession } from "@/components/layout/AppShell";
import { Timeline } from "@/components/log/timeline";
import { Button } from "@/components/ui/Button";
import { useActivities } from "@/hooks/use-activities";
import { useCalendarStore } from "@/stores/calendar";
import { useLogSheetStore } from "@/stores/log-sheet";

export function LogPage() {
  const { userId, timezone } = useAppSession();
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const openSheet = useLogSheetStore((s) => s.openSheet);
  const activities = useActivities(userId, selectedDate, selectedDate);

  return (
    <main>
      <AppHeader
        title="Log"
        action={
          <Button tone="quiet" onClick={() => openSheet()}>
            + Log something
          </Button>
        }
      />
      <DateNavigator timeZone={timezone} />
      <div className="flex gap-2 px-5 pb-4">
        <Link href="/study" className="text-sm text-ink-muted underline decoration-accent underline-offset-4">
          Study
        </Link>
        <Link href="/workout" className="text-sm text-ink-muted underline decoration-accent underline-offset-4">
          Workout
        </Link>
      </div>
      <Timeline activities={activities} />
    </main>
  );
}
