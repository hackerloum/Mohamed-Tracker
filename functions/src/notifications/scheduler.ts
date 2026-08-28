import { formatInTimeZone } from "date-fns-tz";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type DocumentData, type Firestore } from "firebase-admin/firestore";
import { CANONICAL_PRAYERS } from "../../../src/core/types/body";
import { localDate, localHourFrom } from "../../../src/core/dates/localDate";
import type { NextActionContext } from "../../../src/core/engines/nextAction";
import type { UserProfile } from "../../../src/core/types";
import { decideNotification } from "./engine";
import { evaluateNextAction } from "./nextAction";
import { sendPush } from "./send";
import { dedupKey, hasSent, markSent } from "./deduplication";

export interface ScheduleRequest {
  userId: string;
  kind: string;
  runAtIso: string;
}

function db(): Firestore {
  if (getApps().length === 0) initializeApp();
  return getFirestore();
}

function asRecord(value: DocumentData | undefined): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>;
}

export async function enqueueReminder(request: ScheduleRequest): Promise<{ queued: boolean }> {
  const firestore = db();
  const id = dedupKey({
    userId: request.userId,
    kind: request.kind,
    localDate: request.runAtIso.slice(0, 10),
    slot: request.kind,
  });
  await firestore.doc(`users/${request.userId}/reminderJobs/${id}`).set(
    {
      id,
      userId: request.userId,
      kind: request.kind,
      scheduledFor: request.runAtIso,
      status: "scheduled",
      dedupKey: id,
      payload: {},
      timezone: "Africa/Dar_es_Salaam",
      localDate: request.runAtIso.slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return { queued: true };
}

async function loadContext(
  firestore: Firestore,
  userId: string,
  date: string,
): Promise<NextActionContext> {
  const [daySnap, prayerSnap, habitSnap, entrySnap, taskSnap] = await Promise.all([
    firestore.doc(`users/${userId}/days/${date}`).get(),
    firestore.collection(`users/${userId}/prayerEntries`).where("localDate", "==", date).get(),
    firestore.collection(`users/${userId}/habits`).where("archived", "==", false).get(),
    firestore.collection(`users/${userId}/habitEntries`).where("localDate", "==", date).get(),
    firestore.collection(`users/${userId}/tasks`).where("localDate", "==", date).get(),
  ]);

  const day = asRecord(daySnap.data());
  const prayers = CANONICAL_PRAYERS.map((key) => {
    const row = prayerSnap.docs.find((doc) => asRecord(doc.data()).prayerKey === key);
    return { key, completed: Boolean(asRecord(row?.data()).completed) };
  });
  const entries = new Map(
    entrySnap.docs.map((doc) => {
      const data = asRecord(doc.data());
      return [String(data.habitId), data];
    }),
  );
  const habits = habitSnap.docs.map((doc) => {
    const data = asRecord(doc.data());
    const entry = entries.get(doc.id);
    return {
      id: doc.id,
      name: String(data.name ?? "Habit"),
      completed: Boolean(entry?.completed),
      sortOrder: Number(data.sortOrder ?? 0),
    };
  });
  const tasks = taskSnap.docs.map((doc) => {
    const data = asRecord(doc.data());
    return {
      id: doc.id,
      title: String(data.title ?? "Task"),
      completed: Boolean(data.completed) || data.status === "done",
      priority: Boolean(data.priority),
    };
  });

  return {
    nowHour: 0,
    planned: Boolean(day.planned),
    prayers,
    habits,
    tasks,
  };
}

export async function processUser(userId: string, now: Date = new Date()): Promise<{ sent: number }> {
  const firestore = db();
  const profileSnap = await firestore.doc(`users/${userId}`).get();
  if (!profileSnap.exists) return { sent: 0 };
  const profile = profileSnap.data() as UserProfile;
  const timezone = profile.timezone || "Africa/Dar_es_Salaam";
  const date = localDate(now, timezone);
  const hour = localHourFrom(now, timezone);
  const weekday = formatInTimeZone(now, timezone, "i");
  const ctx = await loadContext(firestore, userId, date);
  ctx.nowHour = hour;
  const action = evaluateNextAction(ctx);

  const kind =
    hour === 7
      ? "morningBriefing"
      : hour === 21
        ? "eveningReview"
        : hour === 18 && weekday === "5"
          ? "weeklyReview"
          : "nextAction";

  const sentSnap = await firestore
    .collection(`users/${userId}/notifications`)
    .where("localDate", "==", date)
    .get();
  const kindsSentToday = sentSnap.docs.map((doc) => String(asRecord(doc.data()).dedupKey ?? doc.id));
  const last = sentSnap.docs
    .map((doc) => Date.parse(String(asRecord(doc.data()).createdAt ?? "")))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  const prayerKey = action?.kind === "prayer" ? action.key : null;
  const decision = decideNotification(profile, action, {
    now,
    kind,
    sendsToday: sentSnap.size,
    kindsSentToday,
    lastSentAtMs: last ?? null,
    alreadyPlanned: ctx.planned,
    habitCompleted: action?.kind === "habit" ? ctx.habits.find((row) => row.id === action.habitId)?.completed : false,
    prayerCompleted: prayerKey
      ? ctx.prayers.find((row) => row.key === prayerKey)?.completed
      : false,
    taskCompleted: action?.kind === "task" ? ctx.tasks.find((row) => row.id === action.taskId)?.completed : false,
  });

  if (!decision.shouldSend) {
    return { sent: 0 };
  }
  if (hasSent(decision.dedupKey)) {
    return { sent: 0 };
  }

  const devices = await firestore.collection(`users/${userId}/devices`).get();
  let delivered = 0;
  for (const device of devices.docs) {
    const token = String(asRecord(device.data()).token ?? "");
    const result = await sendPush({
      token,
      title: decision.title,
      body: decision.body,
      data: { url: decision.deepLink, kind: decision.kind },
    });
    if (result.delivered) delivered += 1;
  }

  await firestore.doc(`users/${userId}/notifications/${decision.dedupKey}`).set({
    id: decision.dedupKey,
    userId,
    localDate: date,
    timezone,
    title: decision.title,
    body: decision.body,
    read: false,
    channel: delivered > 0 ? "push" : "in-app",
    kind: decision.kind,
    payload: { url: decision.deepLink },
    dedupKey: decision.dedupKey,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  markSent(decision.dedupKey);
  return { sent: 1 };
}

export async function sweepDueJobs(): Promise<{ scanned: number; enqueued: number }> {
  const firestore = db();
  const users = await firestore.collection("users").limit(8).get();
  let sent = 0;
  for (const user of users.docs) {
    const result = await processUser(user.id);
    sent += result.sent;
  }
  return { scanned: users.size, enqueued: sent };
}
