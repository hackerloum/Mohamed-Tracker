import type { ActivityEvent } from "@/core/types/activity";
import type { CheckIn } from "@/core/types/checkin";
import type { Goal } from "@/core/types/goal";
import type { Reflection } from "@/core/types/reflection";
import type { SleepEntry } from "@/core/types/sleep";

export interface GoalRepository {
  list(userId: string): Promise<Goal[]>;
  get(userId: string, id: string): Promise<Goal | null>;
  upsert(goal: Goal): Promise<Goal>;
  delete(userId: string, id: string): Promise<void>;
}

export interface SleepRepository {
  upsert(entry: SleepEntry): Promise<SleepEntry>;
  get(userId: string, id: string): Promise<SleepEntry | null>;
  findByDate(userId: string, localDate: string): Promise<SleepEntry | null>;
  listInRange(userId: string, start: string, end: string): Promise<SleepEntry[]>;
}

export interface ReflectionRepository {
  upsert(reflection: Reflection): Promise<Reflection>;
  getByDate(userId: string, localDate: string): Promise<Reflection | null>;
}

export interface CheckInRepository {
  upsert(checkIn: CheckIn): Promise<CheckIn>;
  getByDate(userId: string, localDate: string): Promise<CheckIn | null>;
  listInRange(userId: string, start: string, end: string): Promise<CheckIn[]>;
}

export interface ActivityRepository {
  upsert(event: ActivityEvent): Promise<ActivityEvent>;
  listByDate(userId: string, localDate: string): Promise<ActivityEvent[]>;
}
