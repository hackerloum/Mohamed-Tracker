export const REFLECTION_MODES = ["full", "fast"] as const;

export type ReflectionMode = (typeof REFLECTION_MODES)[number];

export interface Reflection {
  id: string;
  userId: string;
  localDate: string;
  timezone: string;
  mode: ReflectionMode;
  wentWell?: string;
  couldBeBetter?: string;
  learned?: string;
  gratefulFor?: string;
  anythingElse?: string;
  dayRating?: number;
  mainWin?: string;
  improveTomorrow?: string;
  createdAt: number;
  updatedAt: number;
}
