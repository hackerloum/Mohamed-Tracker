import { describe, expect, it } from "vitest";
import {
  decideNotification,
  isQuietHoursAt,
  underFatigueCap,
} from "./notificationRules";
import { dedupKey } from "./notificationDedup";
import { deepLinkFor, templateFor } from "./notificationTemplates";
import type { NextAction } from "./nextAction";
import { DEFAULT_NOTIFICATION_PREFS, DEFAULT_QUIET_HOURS } from "@/core/types/user";

const tz = "Africa/Dar_es_Salaam";

describe("isQuietHoursAt", () => {
  it("treats 23:00–06:00 as quiet in Africa/Dar_es_Salaam and wraps midnight", () => {
    expect(isQuietHoursAt(new Date("2026-08-28T19:59:00.000Z"), tz, DEFAULT_QUIET_HOURS)).toBe(false);
    expect(isQuietHoursAt(new Date("2026-08-28T20:00:00.000Z"), tz, DEFAULT_QUIET_HOURS)).toBe(true);
    expect(isQuietHoursAt(new Date("2026-08-28T02:30:00.000Z"), tz, DEFAULT_QUIET_HOURS)).toBe(true);
    expect(isQuietHoursAt(new Date("2026-08-28T03:00:00.000Z"), tz, DEFAULT_QUIET_HOURS)).toBe(false);
  });
});

describe("underFatigueCap", () => {
  it("allows up to four sends per local day and then blocks", () => {
    expect(underFatigueCap({ sendsToday: 3, lastSentAtMs: null, nowMs: 1 })).toBe(true);
    expect(underFatigueCap({ sendsToday: 4, lastSentAtMs: null, nowMs: 1 })).toBe(false);
  });

  it("blocks another send within 30 minutes", () => {
    expect(
      underFatigueCap({
        sendsToday: 1,
        lastSentAtMs: 0,
        nowMs: 29 * 60 * 1000,
      }),
    ).toBe(false);
    expect(
      underFatigueCap({
        sendsToday: 1,
        lastSentAtMs: 0,
        nowMs: 30 * 60 * 1000,
      }),
    ).toBe(true);
  });
});

describe("dedupKey", () => {
  it("is stable for user, kind, local date, and slot", () => {
    expect(
      dedupKey({ userId: "u1", kind: "prayerReminder", localDate: "2026-08-28", slot: "fajr" }),
    ).toBe("u1:prayerReminder:2026-08-28:fajr");
  });
});

describe("decideNotification", () => {
  const action: NextAction = {
    kind: "prayer",
    key: "fajr",
    title: "Pray Fajr",
    reason: "This window has already opened.",
  };

  it("skips during quiet hours even if an action exists", () => {
    const decision = decideNotification({
      now: new Date("2026-08-28T21:00:00.000Z"),
      timezone: tz,
      prefs: DEFAULT_NOTIFICATION_PREFS,
      quietHours: DEFAULT_QUIET_HOURS,
      localDate: "2026-08-29",
      kind: "nextAction",
      action,
      sendsToday: 0,
      kindsSentToday: [],
      lastSentAtMs: null,
      userId: "u1",
    });
    expect(decision.shouldSend).toBe(false);
    expect(decision.reason).toMatch(/quiet hours/i);
  });

  it("skips a prayer reminder when that prayer was already logged", () => {
    const decision = decideNotification({
      now: new Date("2026-08-28T10:00:00.000Z"),
      timezone: tz,
      prefs: DEFAULT_NOTIFICATION_PREFS,
      quietHours: DEFAULT_QUIET_HOURS,
      localDate: "2026-08-28",
      kind: "prayerReminder",
      action,
      sendsToday: 0,
      kindsSentToday: [],
      lastSentAtMs: null,
      userId: "u1",
      prayerCompleted: true,
    });
    expect(decision.shouldSend).toBe(false);
    expect(decision.reason).toMatch(/already/i);
  });

  it("sends a next-action prayer outside quiet hours when nothing is exhausted", () => {
    const decision = decideNotification({
      now: new Date("2026-08-28T10:00:00.000Z"),
      timezone: tz,
      prefs: DEFAULT_NOTIFICATION_PREFS,
      quietHours: DEFAULT_QUIET_HOURS,
      localDate: "2026-08-28",
      kind: "nextAction",
      action,
      sendsToday: 0,
      kindsSentToday: [],
      lastSentAtMs: null,
      userId: "u1",
      prayerCompleted: false,
    });
    expect(decision.shouldSend).toBe(true);
    expect(decision.title).toBe("Pray Fajr");
    expect(decision.deepLink).toBe("/today");
  });
});

describe("templates and deep links", () => {
  it("maps next-action kinds to routes from the plan", () => {
    expect(deepLinkFor({ kind: "plan", title: "Plan", reason: "" })).toBe("/today/plan");
    expect(
      deepLinkFor({ kind: "task", taskId: "t1", title: "Call", reason: "" }),
    ).toBe("/today/task/t1");
    expect(deepLinkFor(null, "weeklyReview")).toBe("/insights/week");
    expect(deepLinkFor(null, "budgetAlert")).toBe("/money");
    expect(deepLinkFor(null, "goalAlert")).toBe("/more/goals");
    expect(templateFor("eveningReview", null).title).toBe("Evening review");
  });
});
