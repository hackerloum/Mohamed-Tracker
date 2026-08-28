import type { BaseRecord, DatedRecord, IsoTimestamp } from "./common";

export interface StudySubject extends BaseRecord {
  name: string;
  archived: boolean;
}

export interface StudySession extends DatedRecord {
  subjectId: string | null;
  topic: string;
  notes: string | null;
  startedAt: IsoTimestamp;
  endedAt: IsoTimestamp;
  durationMinutes: number;
  durationSeconds?: number;
  note?: string;
}
