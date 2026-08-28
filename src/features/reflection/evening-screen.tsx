"use client";

import { useCallback, useEffect, useState } from "react";
import { AtelierShell } from "@/components/inner/atelier-shell";
import {
  PrimaryButton,
  TextAreaField,
  TextField,
} from "@/components/inner/fields";
import { ScalePicker } from "@/components/inner/scale-picker";
import { Sheet } from "@/components/ui/Sheet";
import { formatLocalDate } from "@/core/dates/localDate";
import { formatDurationMinutes } from "@/core/sleep/duration";
import type { CheckIn } from "@/core/types/checkin";
import type { Reflection, ReflectionMode } from "@/core/types/reflection";
import type { Scale1to5, SleepEntry } from "@/core/types/sleep";
import { useInnerSession } from "@/hooks/use-inner-session";

export function EveningScreen() {
  const session = useInnerSession();
  const today = formatLocalDate(new Date(), session.timezone);
  const [mode, setMode] = useState<ReflectionMode>("fast");
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [sleep, setSleep] = useState<SleepEntry | null>(null);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [weeklyAverage, setWeeklyAverage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sheet, setSheet] = useState<"mood" | "sleep" | null>(null);

  const [wentWell, setWentWell] = useState("");
  const [couldBeBetter, setCouldBeBetter] = useState("");
  const [learned, setLearned] = useState("");
  const [gratefulFor, setGratefulFor] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [dayRating, setDayRating] = useState("");
  const [mainWin, setMainWin] = useState("");
  const [improveTomorrow, setImproveTomorrow] = useState("");

  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState<Scale1to5>(3);
  const [sleepNotes, setSleepNotes] = useState("");

  const [mood, setMood] = useState<Scale1to5 | undefined>();
  const [energy, setEnergy] = useState<Scale1to5 | undefined>();
  const [focus, setFocus] = useState<Scale1to5 | undefined>();
  const [stress, setStress] = useState<Scale1to5 | undefined>();

  const load = useCallback(async () => {
    if (!session.userId) {
      return;
    }
    const [savedReflection, savedSleep, savedCheckIn, average] = await Promise.all([
      session.services.reflections.getForDate(session.userId, today),
      session.services.sleep.getForDate(session.userId, today),
      session.services.checkins.getForDate(session.userId, today),
      session.services.sleep.weeklyAverage(session.userId, today),
    ]);

    setReflection(savedReflection);
    setSleep(savedSleep);
    setCheckIn(savedCheckIn);
    setWeeklyAverage(average);

    if (savedReflection) {
      setMode(savedReflection.mode);
      setWentWell(savedReflection.wentWell ?? "");
      setCouldBeBetter(savedReflection.couldBeBetter ?? "");
      setLearned(savedReflection.learned ?? "");
      setGratefulFor(savedReflection.gratefulFor ?? "");
      setAnythingElse(savedReflection.anythingElse ?? "");
      setDayRating(
        savedReflection.dayRating !== undefined
          ? String(savedReflection.dayRating)
          : "",
      );
      setMainWin(savedReflection.mainWin ?? "");
      setImproveTomorrow(savedReflection.improveTomorrow ?? "");
    }

    if (savedSleep) {
      setBedtime(savedSleep.bedtime);
      setWakeTime(savedSleep.wakeTime);
      setQuality(savedSleep.quality);
      setSleepNotes(savedSleep.notes ?? "");
    }

    if (savedCheckIn) {
      setMood(savedCheckIn.mood);
      setEnergy(savedCheckIn.energy);
      setFocus(savedCheckIn.focus);
      setStress(savedCheckIn.stress);
    }
  }, [session.services, session.userId, today]);

  useEffect(() => {
    if (session.status !== "ready") {
      return;
    }
    const timer = window.setTimeout(() => {
      void load().catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load tonight");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load, session.status]);

  async function saveReflection() {
    if (!session.userId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const rating = Number(dayRating);
      const saved = await session.services.reflections.save({
        userId: session.userId,
        timezone: session.timezone,
        localDate: today,
        mode,
        wentWell,
        couldBeBetter,
        learned,
        gratefulFor,
        anythingElse,
        dayRating:
          mode === "fast" && dayRating !== "" && rating >= 1 && rating <= 10
            ? rating
            : undefined,
        mainWin,
        improveTomorrow,
      });
      setReflection(saved);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save the note");
    } finally {
      setSaving(false);
    }
  }

  async function saveSleep() {
    if (!session.userId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await session.services.sleep.log({
        userId: session.userId,
        timezone: session.timezone,
        localDate: today,
        bedtime,
        wakeTime,
        quality,
        notes: sleepNotes,
      });
      setSleep(saved);
      setWeeklyAverage(
        await session.services.sleep.weeklyAverage(session.userId, today),
      );
      setSheet(null);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save sleep");
    } finally {
      setSaving(false);
    }
  }

  async function saveCheckIn() {
    if (!session.userId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await session.services.checkins.save({
        userId: session.userId,
        timezone: session.timezone,
        localDate: today,
        mood,
        energy,
        focus,
        stress,
      });
      setCheckIn(saved);
      setSheet(null);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save check-in");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AtelierShell kicker="Tonight" title="Reflection">
      <p className="max-w-sm text-sm leading-relaxed text-[var(--atelier-muted)]">
        A few minutes for the day, if you want them. Nothing here is required.
      </p>

      {session.backend === "memory" ? (
        <p className="mt-4 text-sm text-[var(--atelier-muted)]">
          Firebase is not connected yet. Saved on this device for now.
        </p>
      ) : null}

      {!session.signedIn && session.backend === "firestore" ? (
        <p className="mt-8 text-sm text-[var(--atelier-muted)]">
          Sign in to keep tonight&apos;s notes.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm">{error}</p> : null}

      <div className="mt-8 flex gap-6 text-sm">
        <button
          type="button"
          onClick={() => setMode("fast")}
          className={
            mode === "fast"
              ? "border-b border-[var(--atelier-accent)] pb-1"
              : "text-[var(--atelier-muted)]"
          }
        >
          Fast
        </button>
        <button
          type="button"
          onClick={() => setMode("full")}
          className={
            mode === "full"
              ? "border-b border-[var(--atelier-accent)] pb-1"
              : "text-[var(--atelier-muted)]"
          }
        >
          Full
        </button>
      </div>

      <form
        className="mt-8 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void saveReflection();
        }}
      >
        {mode === "fast" ? (
          <>
            <TextField
              label="Day rating"
              inputMode="numeric"
              placeholder="1–10"
              value={dayRating}
              onChange={(event) => setDayRating(event.target.value)}
            />
            <TextField
              label="Main win"
              value={mainWin}
              onChange={(event) => setMainWin(event.target.value)}
            />
            <TextField
              label="Improve tomorrow"
              value={improveTomorrow}
              onChange={(event) => setImproveTomorrow(event.target.value)}
            />
          </>
        ) : (
          <>
            <TextAreaField
              label="What went well today?"
              rows={3}
              value={wentWell}
              onChange={(event) => setWentWell(event.target.value)}
            />
            <TextAreaField
              label="What could have been better?"
              rows={3}
              value={couldBeBetter}
              onChange={(event) => setCouldBeBetter(event.target.value)}
            />
            <TextAreaField
              label="What did I learn?"
              rows={3}
              value={learned}
              onChange={(event) => setLearned(event.target.value)}
            />
            <TextAreaField
              label="What am I grateful for?"
              rows={3}
              value={gratefulFor}
              onChange={(event) => setGratefulFor(event.target.value)}
            />
            <TextAreaField
              label="Anything else?"
              rows={3}
              value={anythingElse}
              onChange={(event) => setAnythingElse(event.target.value)}
            />
          </>
        )}
        <PrimaryButton disabled={saving || !session.userId}>
          {saving ? "Saving" : reflection ? "Update note" : "Save note"}
        </PrimaryButton>
      </form>

      <section className="mt-14">
        <h2 className="text-lg tracking-tight">Check-in</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--atelier-muted)]">
          Optional. Skip if you&apos;d rather not.
        </p>
        {checkIn ? (
          <p className="mt-3 tabular text-sm text-[var(--atelier-muted)]">
            Mood {checkIn.mood ?? "—"} · Energy {checkIn.energy ?? "—"} · Focus{" "}
            {checkIn.focus ?? "—"} · Stress {checkIn.stress ?? "—"}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--atelier-muted)]">
            No check-in tonight.
          </p>
        )}
        <button
          type="button"
          onClick={() => setSheet("mood")}
          className="mt-3 text-sm text-[var(--atelier-accent)]"
        >
          {checkIn ? "Revise check-in" : "Add check-in"}
        </button>
      </section>

      <section className="mt-12">
        <h2 className="text-lg tracking-tight">Sleep</h2>
        {weeklyAverage !== null ? (
          <p className="mt-2 tabular text-sm text-[var(--atelier-muted)]">
            This week, about {formatDurationMinutes(weeklyAverage)} a night.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--atelier-muted)]">
            Weekly average appears after a few nights.
          </p>
        )}
        {sleep ? (
          <p className="mt-3 tabular text-sm text-[var(--atelier-muted)]">
            Last night {sleep.bedtime}–{sleep.wakeTime} ·{" "}
            {formatDurationMinutes(sleep.durationMinutes)} · quality {sleep.quality}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--atelier-muted)]">
            Last night isn&apos;t logged.
          </p>
        )}
        <button
          type="button"
          onClick={() => setSheet("sleep")}
          className="mt-3 text-sm text-[var(--atelier-accent)]"
        >
          {sleep ? "Revise sleep" : "Log sleep"}
        </button>
      </section>

      <Sheet
        open={sheet === "mood"}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
        title="Check-in"
        description="Four quiet scales. Leave any of them blank."
      >
        <form
          className="flex flex-col gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            void saveCheckIn();
          }}
        >
          <ScalePicker label="Mood" value={mood} onChange={setMood} optional />
          <ScalePicker label="Energy" value={energy} onChange={setEnergy} optional />
          <ScalePicker label="Focus" value={focus} onChange={setFocus} optional />
          <ScalePicker label="Stress" value={stress} onChange={setStress} optional />
          <PrimaryButton disabled={saving}>
            {saving ? "Saving" : "Save check-in"}
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet
        open={sheet === "sleep"}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
        title="Sleep"
        description="Bedtime, waking, and how it felt. Duration is calculated for you."
      >
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void saveSleep();
          }}
        >
          <TextField
            label="Bedtime"
            type="time"
            value={bedtime}
            onChange={(event) => setBedtime(event.target.value)}
            required
          />
          <TextField
            label="Wake"
            type="time"
            value={wakeTime}
            onChange={(event) => setWakeTime(event.target.value)}
            required
          />
          <ScalePicker
            label="Quality"
            value={quality}
            onChange={(value) => {
              if (value) setQuality(value);
            }}
          />
          <TextAreaField
            label="Notes"
            rows={3}
            value={sleepNotes}
            onChange={(event) => setSleepNotes(event.target.value)}
          />
          <PrimaryButton disabled={saving}>
            {saving ? "Saving" : "Save sleep"}
          </PrimaryButton>
        </form>
      </Sheet>
    </AtelierShell>
  );
}
