import type { DatedRecord } from "./common";

export type DayStage = "morning" | "afternoon" | "evening" | "night";

export interface DayDoc extends DatedRecord {
  planned: boolean;
  cachedScore: number | null;
  stageNotes: Partial<Record<DayStage, string>>;
  priorityTaskIds: string[];
  notes: string | null;
}

export type DayRecord = DayDoc;
