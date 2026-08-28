import type { DatedRecord, IsoTimestamp } from "./common";

export const ACTIVITY_TYPES = [
  "habit",
  "prayer",
  "expense",
  "income",
  "study",
  "workout",
  "task",
  "note",
  "mood",
  "sleep",
  "custom",
  "goal",
  "reflection",
  "activity",
  "checkin",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivitySourceCollection = string;

export interface Activity extends DatedRecord {
  type: ActivityType;
  title: string;
  summary: string;
  sourceId: string;
  sourceCollection: string;
  relatedId: string;
  occurredAt: IsoTimestamp;
  amount?: number;
}

export type ActivityDraft = Omit<Activity, "id" | "createdAt" | "updatedAt" | "summary" | "sourceId" | "sourceCollection"> & {
  summary?: string;
  sourceId?: string;
  sourceCollection?: string;
  relatedId: string;
  occurredAt: IsoTimestamp;
};

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  localDate: string;
  timezone: string;
  title: string;
  sourceId: string;
  sourceCollection: ActivitySourceCollection;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Note extends DatedRecord {
  body: string;
}
