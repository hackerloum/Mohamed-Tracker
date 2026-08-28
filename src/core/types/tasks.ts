import type { BaseRecord, LocalDate } from "./common";

export type TaskStatus = "open" | "done" | "cancelled";

export interface Task extends BaseRecord {
  title: string;
  notes: string;
  status: TaskStatus;
  sortOrder: number;
  dueLocalDate: LocalDate | null;
  localDate: LocalDate | null;
  timezone: string;
  completed: boolean;
  priority: boolean;
}
