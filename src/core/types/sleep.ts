export type Scale1to5 = 1 | 2 | 3 | 4 | 5;

export interface SleepEntry {
  id: string;
  userId: string;
  localDate: string;
  timezone: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: Scale1to5;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
