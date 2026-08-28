import { addLocalDays, nowIso, todayLocalDate } from "@/core/dates/localDate";
import type { AppNotification } from "@/core/types";
import {
  listNotificationsInRange,
  markNotificationRead,
  writeNotification,
} from "@/repositories/notifications";

export async function listRecentNotifications(
  userId: string,
  today: string,
): Promise<AppNotification[]> {
  return listNotificationsInRange(userId, addLocalDays(today, -29), today);
}

export async function createInAppNotification(input: {
  userId: string;
  timezone: string;
  title: string;
  body: string;
  kind: string;
  url?: string;
}): Promise<AppNotification> {
  const stamp = nowIso();
  const localDate = todayLocalDate(input.timezone);
  const record: AppNotification = {
    id: `local-${stamp}`,
    userId: input.userId,
    localDate,
    timezone: input.timezone,
    title: input.title,
    body: input.body,
    read: false,
    channel: "in-app",
    kind: input.kind,
    payload: input.url ? { url: input.url } : {},
    createdAt: stamp,
    updatedAt: stamp,
  };
  await writeNotification(record);
  return record;
}

export { markNotificationRead };
