"use client";

import { useCallback, useEffect, useState } from "react";
import { AtelierShell } from "@/components/inner/atelier-shell";
import {
  PrimaryButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/inner/fields";
import { Sheet } from "@/components/ui/Sheet";
import { GOAL_STATUSES, GOAL_TYPES, type Goal, type GoalType } from "@/core/types/goal";
import { useInnerSession } from "@/hooks/use-inner-session";

const TYPE_COPY: Record<GoalType, string> = {
  amount: "Amount",
  count: "Count",
  duration: "Duration",
  percentage: "Percentage",
  manual: "Manual",
};

function formatGoalNumbers(goal: Goal): string {
  const unit = goal.unit ? ` ${goal.unit}` : "";
  return `${goal.current}${unit} of ${goal.target}${unit}`.trim();
}

interface GoalDraft {
  title: string;
  description: string;
  type: GoalType;
  target: string;
  current: string;
  unit: string;
  deadline: string;
  status: Goal["status"];
  milestoneTitle: string;
  milestoneTarget: string;
}

const emptyDraft: GoalDraft = {
  title: "",
  description: "",
  type: "count",
  target: "",
  current: "",
  unit: "",
  deadline: "",
  status: "active",
  milestoneTitle: "",
  milestoneTarget: "",
};

function draftFromGoal(goal: Goal): GoalDraft {
  const open = goal.milestones.find((item) => item.reachedAt === undefined);
  return {
    title: goal.title,
    description: goal.description,
    type: goal.type,
    target: String(goal.target),
    current: String(goal.current),
    unit: goal.unit ?? "",
    deadline: goal.deadline ?? "",
    status: goal.status,
    milestoneTitle: open?.title ?? "",
    milestoneTarget: open ? String(open.targetValue) : "",
  };
}

export function GoalsScreen() {
  const session = useInnerSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"create" | "edit" | "progress" | null>(null);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [draft, setDraft] = useState<GoalDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!session.userId) {
      setGoals([]);
      return;
    }
    const rows = await session.services.goals.list(session.userId);
    setGoals(rows);
  }, [session.services.goals, session.userId]);

  useEffect(() => {
    if (session.status !== "ready") {
      return;
    }
    const timer = window.setTimeout(() => {
      void refresh().catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load goals");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, session.status]);

  function openCreate() {
    setSelected(null);
    setDraft(emptyDraft);
    setSheet("create");
  }

  function openEdit(goal: Goal) {
    setSelected(goal);
    setDraft(draftFromGoal(goal));
    setSheet("edit");
  }

  function openProgress(goal: Goal) {
    setSelected(goal);
    setDraft(draftFromGoal(goal));
    setSheet("progress");
  }

  async function saveGoal() {
    if (!session.userId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const target = Number(draft.target);
      const current = draft.current === "" ? 0 : Number(draft.current);
      const milestones =
        draft.milestoneTitle.trim() && draft.milestoneTarget !== ""
          ? [
              {
                id: selected?.milestones[0]?.id ?? crypto.randomUUID(),
                title: draft.milestoneTitle.trim(),
                targetValue: Number(draft.milestoneTarget),
                reachedAt: selected?.milestones[0]?.reachedAt,
              },
            ]
          : selected?.milestones ?? [];

      if (selected && sheet === "edit") {
        await session.services.goals.update(session.userId, selected.id, {
          title: draft.title,
          description: draft.description,
          target,
          current,
          unit: draft.unit.trim() || undefined,
          deadline: draft.deadline || null,
          status: draft.status,
          milestones,
        });
      } else {
        await session.services.goals.create({
          userId: session.userId,
          timezone: session.timezone,
          title: draft.title,
          description: draft.description,
          type: draft.type,
          target,
          current,
          unit: draft.unit.trim() || undefined,
          deadline: draft.deadline || undefined,
          milestones,
        });
      }
      setSheet(null);
      await refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save the goal");
    } finally {
      setSaving(false);
    }
  }

  async function saveProgress() {
    if (!session.userId || !selected) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await session.services.goals.setProgress(
        session.userId,
        selected.id,
        Number(draft.current),
      );
      setSheet(null);
      await refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not update progress");
    } finally {
      setSaving(false);
    }
  }

  async function removeGoal() {
    if (!session.userId || !selected) {
      return;
    }
    setSaving(true);
    try {
      await session.services.goals.remove(session.userId, selected.id);
      setSheet(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AtelierShell
      kicker="More"
      title="Goals"
      action={
        session.userId ? (
          <button
            type="button"
            onClick={openCreate}
            className="text-sm text-[var(--atelier-accent)]"
          >
            Add
          </button>
        ) : null
      }
    >
      <p className="max-w-sm text-sm leading-relaxed text-[var(--atelier-muted)]">
        Quiet markers for things that take time. Progress is a number, not a
        celebration.
      </p>

      {session.backend === "memory" ? (
        <p className="mt-4 text-sm text-[var(--atelier-muted)]">
          Firebase is not connected yet. Saved on this device for now.
        </p>
      ) : null}

      {!session.signedIn && session.backend === "firestore" ? (
        <p className="mt-8 text-sm text-[var(--atelier-muted)]">
          Sign in to keep goals in your private account.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[var(--atelier-muted)]">{error}</p> : null}

      {session.status === "ready" && session.userId && goals.length === 0 ? (
        <p className="mt-12 text-sm text-[var(--atelier-muted)]">
          No goals yet. Add one when something is worth keeping.
        </p>
      ) : null}

      <ul className="mt-10">
        {goals.map((goal) => (
          <li key={goal.id} className="border-t border-[var(--atelier-line)] py-5">
            <button
              type="button"
              onClick={() => openEdit(goal)}
              className="w-full text-left"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg tracking-tight">{goal.title}</h2>
                <span className="tabular text-sm text-[var(--atelier-muted)]">
                  {goal.progressPercent}%
                </span>
              </div>
              {goal.description ? (
                <p className="mt-1 text-sm text-[var(--atelier-muted)]">
                  {goal.description}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-[var(--atelier-muted)]">
                {formatGoalNumbers(goal)}
                {goal.deadline ? ` · ${goal.deadline}` : ""}
                {` · ${goal.status}`}
              </p>
              <div className="atelier-progress mt-4">
                <span style={{ width: `${goal.progressPercent}%` }} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => openProgress(goal)}
              className="mt-3 text-sm text-[var(--atelier-accent)]"
            >
              Update progress
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={sheet === "create" || sheet === "edit"}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
        title={sheet === "edit" ? "Edit goal" : "New goal"}
        description="A title, a target, and an honest current number."
      >
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void saveGoal();
          }}
        >
          <TextField
            label="Title"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            required
          />
          <TextAreaField
            label="Description"
            rows={3}
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
          />
          {sheet === "create" ? (
            <SelectField
              label="Type"
              value={draft.type}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as GoalType })
              }
            >
              {GOAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_COPY[type]}
                </option>
              ))}
            </SelectField>
          ) : (
            <SelectField
              label="Status"
              value={draft.status}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  status: event.target.value as Goal["status"],
                })
              }
            >
              {GOAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectField>
          )}
          <TextField
            label="Target"
            inputMode="decimal"
            value={draft.target}
            onChange={(event) => setDraft({ ...draft, target: event.target.value })}
            required
          />
          <TextField
            label="Current"
            inputMode="decimal"
            value={draft.current}
            onChange={(event) => setDraft({ ...draft, current: event.target.value })}
          />
          <TextField
            label="Unit"
            placeholder="hours, books, TZS"
            value={draft.unit}
            onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
          />
          <TextField
            label="Deadline"
            type="date"
            value={draft.deadline}
            onChange={(event) => setDraft({ ...draft, deadline: event.target.value })}
          />
          <TextField
            label="Milestone"
            placeholder="Optional"
            value={draft.milestoneTitle}
            onChange={(event) =>
              setDraft({ ...draft, milestoneTitle: event.target.value })
            }
          />
          <TextField
            label="Milestone target"
            inputMode="decimal"
            value={draft.milestoneTarget}
            onChange={(event) =>
              setDraft({ ...draft, milestoneTarget: event.target.value })
            }
          />
          <PrimaryButton disabled={saving}>
            {saving ? "Saving" : "Save"}
          </PrimaryButton>
          {sheet === "edit" ? (
            <button
              type="button"
              onClick={() => void removeGoal()}
              className="text-left text-sm text-[var(--atelier-muted)]"
            >
              Remove
            </button>
          ) : null}
        </form>
      </Sheet>

      <Sheet
        open={sheet === "progress"}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
        title="Progress"
        description={selected ? selected.title : undefined}
      >
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void saveProgress();
          }}
        >
          <TextField
            label="Current"
            inputMode="decimal"
            value={draft.current}
            onChange={(event) => setDraft({ ...draft, current: event.target.value })}
            required
          />
          <PrimaryButton disabled={saving}>
            {saving ? "Saving" : "Update"}
          </PrimaryButton>
        </form>
      </Sheet>
    </AtelierShell>
  );
}
