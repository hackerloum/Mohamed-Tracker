import { create } from "zustand";
import { todayLocalDate } from "@/core/dates/localDate";
import type { LocalDate } from "@/core/types/common";

interface CalendarState {
  selectedDate: LocalDate;
  setSelectedDate: (date: LocalDate) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: todayLocalDate(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
