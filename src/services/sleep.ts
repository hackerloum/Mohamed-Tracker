import { formatLocalDate, weekWindow } from "@/core/dates/localDate";
import { logSleepInputSchema } from "@/core/schemas/sleep";
import {
  sleepDurationMinutes,
  weeklyAverageMinutes,
} from "@/core/sleep/duration";
import type { SleepEntry } from "@/core/types/sleep";
import type { ActivityRepository, SleepRepository } from "@/repositories/contracts";
import { emitActivity } from "@/services/inner-activity";

export interface LogSleepInput {
  userId: string;
  timezone: string;
  bedtime: string;
  wakeTime: string;
  quality: SleepEntry["quality"];
  notes?: string;
  localDate?: string;
}

export interface SleepServiceDeps {
  sleep: SleepRepository;
  activities: ActivityRepository;
  now?: () => number;
  createId?: () => string;
  localDateFor?: (at: number, timeZone: string) => string;
}

export function createSleepService(deps: SleepServiceDeps) {
  const now = deps.now ?? Date.now;
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const localDateFor =
    deps.localDateFor ??
    ((at: number, timeZone: string) => formatLocalDate(new Date(at), timeZone));

  return {
    async getForDate(userId: string, localDate: string): Promise<SleepEntry | null> {
      return deps.sleep.findByDate(userId, localDate);
    },

    async log(input: LogSleepInput): Promise<SleepEntry> {
      const parsed = logSleepInputSchema.parse(input);
      const timestamp = now();
      const localDate =
        parsed.localDate ?? localDateFor(timestamp, parsed.timezone);
      const existing = await deps.sleep.findByDate(parsed.userId, localDate);
      const durationMinutes = sleepDurationMinutes(
        parsed.bedtime,
        parsed.wakeTime,
      );

      const entry: SleepEntry = {
        id: existing?.id ?? createId(),
        userId: parsed.userId,
        localDate,
        timezone: parsed.timezone,
        bedtime: parsed.bedtime,
        wakeTime: parsed.wakeTime,
        durationMinutes,
        quality: parsed.quality,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      if (parsed.notes?.trim()) {
        entry.notes = parsed.notes.trim();
      }

      const saved = await deps.sleep.upsert(entry);
      await emitActivity(deps.activities, {
        userId: saved.userId,
        type: "sleep",
        localDate: saved.localDate,
        timezone: saved.timezone,
        title: "Sleep",
        sourceId: saved.id,
        sourceCollection: "sleep",
        occurredAt: saved.updatedAt,
        createdAt: saved.createdAt,
      });
      return saved;
    },

    async weeklyAverage(
      userId: string,
      endDate: string,
    ): Promise<number | null> {
      const { start, end } = weekWindow(endDate);
      const entries = await deps.sleep.listInRange(userId, start, end);
      return weeklyAverageMinutes(entries, endDate);
    },

    async listInRange(
      userId: string,
      start: string,
      end: string,
    ): Promise<SleepEntry[]> {
      return deps.sleep.listInRange(userId, start, end);
    },
  };
}

export type SleepService = ReturnType<typeof createSleepService>;
