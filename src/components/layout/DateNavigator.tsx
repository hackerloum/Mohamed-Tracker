"use client";

import { addLocalDays, formatLocalDateHeading, todayLocalDate } from "@/core/dates";
import type { LocalDate } from "@/core/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarStore } from "@/stores/calendar";

type Controlled = {
  date: LocalDate;
  timezone: string;
  onChange: (next: LocalDate) => void;
  timeZone?: never;
};

type CalendarDriven = {
  timeZone: string;
  date?: never;
  timezone?: never;
  onChange?: never;
};

export function DateNavigator(props: Controlled | CalendarDriven) {
  const storeDate = useCalendarStore((s) => s.selectedDate);
  const setStoreDate = useCalendarStore((s) => s.setSelectedDate);

  if ("timeZone" in props && props.timeZone) {
    const today = todayLocalDate(props.timeZone);
    return (
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          aria-label="Previous day"
          onClick={() => setStoreDate(addLocalDays(storeDate, -1))}
          className="p-2 text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => setStoreDate(today)} className="text-sm text-ink">
          {formatLocalDateHeading(storeDate, props.timeZone)}
        </button>
        <button
          type="button"
          aria-label="Next day"
          onClick={() => setStoreDate(addLocalDays(storeDate, 1))}
          className="p-2 text-ink-muted hover:text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  const { date, timezone, onChange } = props as Controlled;
  return (
    <div className="flex items-center justify-between py-2">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => onChange(addLocalDays(date, -1))}
        className="p-2 text-ink-muted hover:text-ink"
      >
        <ChevronLeft size={18} />
      </button>
      <p className="text-sm text-ink">{formatLocalDateHeading(date, timezone)}</p>
      <button
        type="button"
        aria-label="Next day"
        onClick={() => onChange(addLocalDays(date, 1))}
        className="p-2 text-ink-muted hover:text-ink"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
