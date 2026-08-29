"use client";

import { useState } from "react";
import { addLocalDays, todayLocalDate } from "@/core/dates/localDate";
import {
  WORKOUT_TYPE_LABELS,
  WORKOUT_TYPES,
  type WorkoutSet,
  type WorkoutType,
} from "@/core/types/workout";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAppSession } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { useWorkouts } from "@/hooks/use-workouts";
import { logWorkout } from "@/services/workout";

export function WorkoutPage() {
  const { userId, timezone } = useAppSession();
  const today = todayLocalDate(timezone);
  const workouts = useWorkouts(userId, addLocalDays(today, -30), today);
  const [type, setType] = useState<WorkoutType>("gym");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [sets, setSets] = useState<WorkoutSet[]>([
    { exercise: "", reps: null, weightKg: null },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minutes = Number.parseInt(duration, 10);

  async function saveQuick() {
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError("Duration is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const detailed = showDetails
        ? sets.filter((set) => set.exercise.trim().length > 0)
        : [];
      await logWorkout({
        userId,
        timezone,
        type,
        durationMinutes: minutes,
        notes: notes.trim() ? notes.trim() : null,
        sets: detailed,
      });
      setNotes("");
      setSets([{ exercise: "", reps: null, weightKg: null }]);
      setShowDetails(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save workout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <AppHeader title="Workout" />
      <section className="px-5 pb-6">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-ink-muted">Type</p>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_TYPES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                type === item
                  ? "bg-accent text-accent-ink"
                  : "border border-hairline text-ink-muted"
              }`}
            >
              {WORKOUT_TYPE_LABELS[item]}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Field label="Duration (minutes)">
            <TextInput
              inputMode="numeric"
              className="tabular"
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <button
          type="button"
          className="mt-4 text-sm text-ink-muted underline decoration-accent underline-offset-4"
          onClick={() => setShowDetails((value) => !value)}
        >
          {showDetails ? "Hide sets" : "Add sets (optional)"}
        </button>
        {showDetails ? (
          <div className="mt-4 space-y-3">
            {sets.map((set, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <TextInput
                  placeholder="Exercise"
                  value={set.exercise}
                  onChange={(e) =>
                    updateSet(sets, setSets, index, { exercise: e.target.value })
                  }
                />
                <TextInput
                  inputMode="numeric"
                  placeholder="Reps"
                  className="tabular"
                  value={set.reps ?? ""}
                  onChange={(e) =>
                    updateSet(sets, setSets, index, {
                      reps: parseOptionalNumber(e.target.value),
                    })
                  }
                />
                <TextInput
                  inputMode="decimal"
                  placeholder="Kg"
                  className="tabular"
                  value={set.weightKg ?? ""}
                  onChange={(e) =>
                    updateSet(sets, setSets, index, {
                      weightKg: parseOptionalNumber(e.target.value),
                    })
                  }
                />
              </div>
            ))}
            <Button
              tone="ghost"
              type="button"
              onClick={() =>
                setSets((current) => [
                  ...current,
                  { exercise: "", reps: null, weightKg: null },
                ])
              }
            >
              Add set
            </Button>
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={busy || !minutes} onClick={() => void saveQuick()}>
          {busy ? "Saving…" : "Log workout"}
        </Button>
      </section>
      <section className="px-5 pb-8">
        <h2 className="mb-3 text-xs uppercase tracking-[0.16em] text-ink-muted">Recent</h2>
        {workouts.length === 0 ? (
          <p className="text-ink-muted">No workouts logged yet.</p>
        ) : (
          <ul>
            {[...workouts]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((workout) => (
                <li key={workout.id} className="border-t border-hairline py-3">
                  <p>
                    {WORKOUT_TYPE_LABELS[workout.type]}
                    <span className="tabular text-ink-muted">
                      {" "}
                      Â· {workout.durationMinutes}m
                    </span>
                  </p>
                  {workout.sets.length > 0 ? (
                    <p className="text-sm text-ink-muted">
                      {workout.sets
                        .map((set) =>
                          [set.exercise, set.reps, set.weightKg ? `${set.weightKg}kg` : null]
                            .filter(Boolean)
                            .join(" "),
                        )
                        .join(" Â· ")}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function updateSet(
  sets: WorkoutSet[],
  setSets: (sets: WorkoutSet[]) => void,
  index: number,
  patch: Partial<WorkoutSet>,
) {
  setSets(sets.map((set, i) => (i === index ? { ...set, ...patch } : set)));
}
