import { formatLocalDate } from "@/core/dates/localDate";
import { saveReflectionInputSchema } from "@/core/schemas/reflection";
import type { Reflection } from "@/core/types/reflection";
import type {
  ActivityRepository,
  ReflectionRepository,
} from "@/repositories/contracts";
import { emitActivity } from "@/services/inner-activity";

export interface SaveReflectionInput {
  userId: string;
  timezone: string;
  localDate?: string;
  mode: Reflection["mode"];
  wentWell?: string;
  couldBeBetter?: string;
  learned?: string;
  gratefulFor?: string;
  anythingElse?: string;
  dayRating?: number;
  mainWin?: string;
  improveTomorrow?: string;
}

export interface ReflectionServiceDeps {
  reflections: ReflectionRepository;
  activities: ActivityRepository;
  now?: () => number;
  localDateFor?: (at: number, timeZone: string) => string;
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createReflectionService(deps: ReflectionServiceDeps) {
  const now = deps.now ?? Date.now;
  const localDateFor =
    deps.localDateFor ??
    ((at: number, timeZone: string) => formatLocalDate(new Date(at), timeZone));

  return {
    async getForDate(
      userId: string,
      localDate: string,
    ): Promise<Reflection | null> {
      return deps.reflections.getByDate(userId, localDate);
    },

    async save(input: SaveReflectionInput): Promise<Reflection> {
      const parsed = saveReflectionInputSchema.parse(input);
      const timestamp = now();
      const localDate =
        parsed.localDate ?? localDateFor(timestamp, parsed.timezone);
      const existing = await deps.reflections.getByDate(parsed.userId, localDate);

      const reflection: Reflection = {
        id: localDate,
        userId: parsed.userId,
        localDate,
        timezone: parsed.timezone,
        mode: parsed.mode,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };

      const wentWell = trimOptional(parsed.wentWell);
      if (wentWell) reflection.wentWell = wentWell;
      const couldBeBetter = trimOptional(parsed.couldBeBetter);
      if (couldBeBetter) reflection.couldBeBetter = couldBeBetter;
      const learned = trimOptional(parsed.learned);
      if (learned) reflection.learned = learned;
      const gratefulFor = trimOptional(parsed.gratefulFor);
      if (gratefulFor) reflection.gratefulFor = gratefulFor;
      const anythingElse = trimOptional(parsed.anythingElse);
      if (anythingElse) reflection.anythingElse = anythingElse;
      const mainWin = trimOptional(parsed.mainWin);
      if (mainWin) reflection.mainWin = mainWin;
      const improveTomorrow = trimOptional(parsed.improveTomorrow);
      if (improveTomorrow) reflection.improveTomorrow = improveTomorrow;
      if (parsed.dayRating !== undefined) {
        reflection.dayRating = parsed.dayRating;
      }

      const saved = await deps.reflections.upsert(reflection);
      await emitActivity(deps.activities, {
        userId: saved.userId,
        type: "reflection",
        localDate: saved.localDate,
        timezone: saved.timezone,
        title: saved.mode === "fast" ? "Evening note" : "Reflection",
        sourceId: saved.id,
        sourceCollection: "reflections",
        occurredAt: saved.updatedAt,
        createdAt: saved.createdAt,
      });
      return saved;
    },
  };
}

export type ReflectionService = ReturnType<typeof createReflectionService>;
