"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TIMEZONE, localDate } from "@/core/dates";
import type { LocalDate, ThemeMode } from "@/core/types";

export type QuickAddKind = "task" | "habit" | "note" | "expense" | "study" | "workout";

interface UiState {
  selectedDate: LocalDate;
  timezone: string;
  theme: ThemeMode;
  quickAddOpen: boolean;
  quickAddKind: QuickAddKind;
  planSheetOpen: boolean;
  prayerDetailKey: string | null;
  setSelectedDate: (date: LocalDate) => void;
  setTimezone: (timezone: string) => void;
  setTheme: (theme: ThemeMode) => void;
  openQuickAdd: (kind?: QuickAddKind) => void;
  closeQuickAdd: () => void;
  setQuickAddKind: (kind: QuickAddKind) => void;
  openPlanSheet: () => void;
  closePlanSheet: () => void;
  openPrayerDetail: (key: string) => void;
  closePrayerDetail: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedDate: localDate(new Date(), DEFAULT_TIMEZONE),
      timezone: DEFAULT_TIMEZONE,
      theme: "system",
      quickAddOpen: false,
      quickAddKind: "task",
      planSheetOpen: false,
      prayerDetailKey: null,
      setSelectedDate: (date) => set({ selectedDate: date }),
      setTimezone: (timezone) => set({ timezone }),
      setTheme: (theme) => set({ theme }),
      openQuickAdd: (kind = "task") => set({ quickAddOpen: true, quickAddKind: kind }),
      closeQuickAdd: () => set({ quickAddOpen: false }),
      setQuickAddKind: (kind) => set({ quickAddKind: kind }),
      openPlanSheet: () => set({ planSheetOpen: true }),
      closePlanSheet: () => set({ planSheetOpen: false }),
      openPrayerDetail: (key) => set({ prayerDetailKey: key }),
      closePrayerDetail: () => set({ prayerDetailKey: null }),
    }),
    {
      name: "mohamed-ui",
      partialize: (state) => ({
        theme: state.theme,
        timezone: state.timezone,
      }),
    },
  ),
);
