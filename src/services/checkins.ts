import { formatLocalDate } from "@/core/dates/localDate";
import { saveCheckInInputSchema } from "@/core/schemas/checkin";
import type { CheckIn } from "@/core/types/checkin";
import type {
  ActivityRepository,
  CheckInRepository,
} from "@/repositories/contracts";
import { emitActivity } from "@/services/inner-activity";

export interface SaveCheckInInput {
  userId: string;
  timezone: string;
  localDate?: string;
  mood?: CheckIn["mood"];
  energy?: CheckIn["energy"];
  focus?: CheckIn["focus"];
  stress?: CheckIn["stress"];
}

export interface CheckInServiceDeps {
  checkins: CheckInRepository;
  activities: ActivityRepository;
  now?: () => number;
  localDateFor?: (at: number, timeZone: string) => string;
}

export function createCheckInService(deps: CheckInServiceDeps) {
  const now = deps.now ?? Date.now;
  const localDateFor =
    deps.localDateFor ??
    ((at: number, timeZone: string) => formatLocalDate(new Date(at), timeZone));

  return {
    async getForDate(userId: string, localDate: string): Promise<CheckIn | null> {
      return deps.checkins.getByDate(userId, localDate);
    },

    async listInRange(userId: string, start: string, end: string): Promise<CheckIn[]> {
      return deps.checkins.listInRange(userId, start, end);
    },

    async save(input: SaveCheckInInput): Promise<CheckIn> {
      const parsed = saveCheckInInputSchema.parse(input);
      const timestamp = now();
      const localDate =
        parsed.localDate ?? localDateFor(timestamp, parsed.timezone);
      const existing = await deps.checkins.getByDate(parsed.userId, localDate);

      const checkIn: CheckIn = {
        id: localDate,
        userId: parsed.userId,
        localDate,
        timezone: parsed.timezone,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      if (parsed.mood) checkIn.mood = parsed.mood;
      if (parsed.energy) checkIn.energy = parsed.energy;
      if (parsed.focus) checkIn.focus = parsed.focus;
      if (parsed.stress) checkIn.stress = parsed.stress;

      const saved = await deps.checkins.upsert(checkIn);
      await emitActivity(deps.activities, {
        userId: saved.userId,
        type: "mood",
        localDate: saved.localDate,
        timezone: saved.timezone,
        title: "Check-in",
        sourceId: saved.id,
        sourceCollection: "checkins",
        occurredAt: saved.updatedAt,
        createdAt: saved.createdAt,
      });
      return saved;
    },
  };
}

export type CheckInService = ReturnType<typeof createCheckInService>;
