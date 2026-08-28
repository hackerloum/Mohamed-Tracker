import { toLocalDate } from "@/core/dates/localDate";
import { activityIdFor, mapWorkoutToActivity } from "@/core/activity/mapping";
import { workoutInputSchema } from "@/core/schemas/log";
import type { Workout, WorkoutSet, WorkoutType } from "@/core/types/workout";
import { createWorkout } from "@/repositories/workouts";
import { upsertActivity } from "@/repositories/activities";

export async function logWorkout(input: {
  userId: string;
  timezone: string;
  type: WorkoutType;
  durationMinutes: number;
  notes: string | null;
  sets?: WorkoutSet[];
}): Promise<Workout> {
  const parsed = workoutInputSchema.parse({
    type: input.type,
    durationMinutes: input.durationMinutes,
    notes: input.notes,
    sets: input.sets ?? [],
    timezone: input.timezone,
  });
  const now = new Date();
  const workout = await createWorkout({
    userId: input.userId,
    timezone: parsed.timezone,
    type: parsed.type,
    durationMinutes: parsed.durationMinutes,
    notes: parsed.notes,
    sets: parsed.sets.filter((set) => set.exercise.trim().length > 0),
    localDate: toLocalDate(now, parsed.timezone),
  });
  await upsertActivity(activityIdFor(workout), mapWorkoutToActivity(workout));
  return workout;
}
