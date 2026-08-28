import type { UserProfile } from "../../../src/core/types";
import type { NextAction } from "../../../src/core/engines/nextAction";
import {
  decideNotification as coreDecide,
  type NotificationDecision as CoreDecision,
} from "../../../src/core/engines/notificationRules";
import type { NotificationKind } from "../../../src/core/engines/notificationTemplates";
import { localDate } from "../../../src/core/dates/localDate";

export type NotificationDecision = CoreDecision;

export function decideNotification(
  profile: UserProfile,
  action: NextAction | null,
  extras: {
    now?: Date;
    kind?: NotificationKind;
    sendsToday?: number;
    kindsSentToday?: string[];
    lastSentAtMs?: number | null;
    alreadyPlanned?: boolean;
    habitCompleted?: boolean;
    prayerCompleted?: boolean;
    taskCompleted?: boolean;
    budgetOver?: boolean;
    goalReached?: boolean;
  } = {},
): NotificationDecision {
  const now = extras.now ?? new Date();
  return coreDecide({
    now,
    timezone: profile.timezone,
    prefs: profile.notificationPrefs,
    quietHours: profile.quietHours ?? profile.notificationPrefs.quietHours,
    localDate: localDate(now, profile.timezone),
    kind: extras.kind ?? "nextAction",
    action,
    sendsToday: extras.sendsToday ?? 0,
    kindsSentToday: extras.kindsSentToday ?? [],
    lastSentAtMs: extras.lastSentAtMs ?? null,
    userId: profile.userId,
    alreadyPlanned: extras.alreadyPlanned,
    habitCompleted: extras.habitCompleted,
    prayerCompleted: extras.prayerCompleted,
    taskCompleted: extras.taskCompleted,
    budgetOver: extras.budgetOver,
    goalReached: extras.goalReached,
  });
}
