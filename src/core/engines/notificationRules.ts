import { formatInTimeZone } from "date-fns-tz";
import type { NotificationPrefs, QuietHours } from "@/core/types/user";
import { DEFAULT_TIMEZONE } from "@/core/dates/localDate";
import type { NextAction } from "./nextAction";
import { dedupKey } from "./notificationDedup";
import {
  deepLinkFor,
  templateFor,
  type NotificationKind,
} from "./notificationTemplates";

export interface FatigueInput {
  sendsToday: number;
  lastSentAtMs: number | null;
  nowMs: number;
}

export interface NotificationDecision {
  shouldSend: boolean;
  reason: string;
  action: NextAction | null;
  title: string;
  body: string;
  deepLink: string;
  dedupKey: string;
  kind: NotificationKind;
}

export interface DecideNotificationInput {
  now: Date;
  timezone: string;
  prefs: NotificationPrefs;
  quietHours: QuietHours;
  localDate: string;
  kind: NotificationKind;
  action: NextAction | null;
  sendsToday: number;
  kindsSentToday: string[];
  lastSentAtMs: number | null;
  userId: string;
  alreadyPlanned?: boolean;
  habitCompleted?: boolean;
  prayerCompleted?: boolean;
  taskCompleted?: boolean;
  budgetOver?: boolean;
  goalReached?: boolean;
}

export const MAX_PUSHES_PER_DAY = 4;
export const MIN_GAP_MS = 30 * 60 * 1000;

function clockMinutes(clock: string): number {
  const [hours, minutes] = clock.split(":").map((part) => Number.parseInt(part, 10));
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function isQuietHoursAt(
  now: Date,
  timezone: string = DEFAULT_TIMEZONE,
  quietHours: QuietHours,
): boolean {
  const current = clockMinutes(formatInTimeZone(now, timezone, "HH:mm"));
  const start = clockMinutes(quietHours.start);
  const end = clockMinutes(quietHours.end);
  if (start === end) return false;
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

export function underFatigueCap(input: FatigueInput): boolean {
  if (input.sendsToday >= MAX_PUSHES_PER_DAY) return false;
  if (input.lastSentAtMs !== null && input.nowMs - input.lastSentAtMs < MIN_GAP_MS) {
    return false;
  }
  return true;
}

function prefEnabled(prefs: NotificationPrefs, kind: NotificationKind, action: NextAction | null): boolean {
  if (kind === "morningBriefing") return prefs.morningBriefing;
  if (kind === "eveningReview") return prefs.eveningReview;
  if (kind === "weeklyReview") return prefs.weeklyReview;
  if (kind === "habitReminder") return prefs.habitReminders;
  if (kind === "prayerReminder") return prefs.prayerReminders;
  if (kind === "budgetAlert") return prefs.budgetAlerts;
  if (kind === "goalAlert") return prefs.goalAlerts;
  if (kind === "nextAction") {
    if (action?.kind === "prayer") return prefs.prayerReminders;
    return prefs.habitReminders;
  }
  return true;
}

export function decideNotification(input: DecideNotificationInput): NotificationDecision {
  const slot =
    input.action?.kind === "prayer"
      ? input.action.key
      : input.action?.kind === "habit"
        ? input.action.habitId
        : input.action?.kind === "task"
          ? input.action.taskId
          : input.kind;
  const key = dedupKey({
    userId: input.userId,
    kind: input.kind,
    localDate: input.localDate,
    slot,
  });
  const template = templateFor(input.kind, input.action);
  const base = {
    action: input.action,
    title: template.title,
    body: template.body,
    deepLink: deepLinkFor(input.action, input.kind),
    dedupKey: key,
    kind: input.kind,
  };

  if (!prefEnabled(input.prefs, input.kind, input.action)) {
    return { ...base, shouldSend: false, reason: "Category is off in settings." };
  }

  if (isQuietHoursAt(input.now, input.timezone, input.quietHours)) {
    return { ...base, shouldSend: false, reason: "Quiet hours (23:00–06:00)." };
  }

  if (input.kindsSentToday.includes(key)) {
    return { ...base, shouldSend: false, reason: "Already sent this slot today." };
  }

  if (
    !underFatigueCap({
      sendsToday: input.sendsToday,
      lastSentAtMs: input.lastSentAtMs,
      nowMs: input.now.getTime(),
    })
  ) {
    return { ...base, shouldSend: false, reason: "Fatigue cap reached." };
  }

  if (input.kind === "prayerReminder" || input.action?.kind === "prayer") {
    if (input.prayerCompleted) {
      return { ...base, shouldSend: false, reason: "Prayer already logged." };
    }
  }
  if (input.kind === "habitReminder" || input.action?.kind === "habit") {
    if (input.habitCompleted) {
      return { ...base, shouldSend: false, reason: "Habit already completed." };
    }
  }
  if (input.action?.kind === "plan" && input.alreadyPlanned) {
    return { ...base, shouldSend: false, reason: "Day already planned." };
  }
  if (input.action?.kind === "task" && input.taskCompleted) {
    return { ...base, shouldSend: false, reason: "Task already completed." };
  }
  if (input.kind === "budgetAlert" && !input.budgetOver) {
    return { ...base, shouldSend: false, reason: "Budget is still under its limit." };
  }
  if (input.kind === "goalAlert" && !input.goalReached) {
    return { ...base, shouldSend: false, reason: "Goal has not reached its target." };
  }
  if (input.kind === "nextAction" && !input.action) {
    return { ...base, shouldSend: false, reason: "No next action right now." };
  }

  return { ...base, shouldSend: true, reason: "Passed re-check." };
}
