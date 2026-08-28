import type { BaseRecord, DatedRecord, IsoTimestamp, LocalDate, IanaTimezone } from "./common";

export type DevicePlatform = "web" | "ios-pwa" | "android";

export interface UserDevice extends BaseRecord {
  token: string;
  platform: DevicePlatform;
  userAgent: string;
  lastSeenAt: IsoTimestamp;
}

export type NotificationChannel = "push" | "in-app";

export interface AppNotification extends DatedRecord {
  title: string;
  body: string;
  read: boolean;
  channel: NotificationChannel;
  kind: string;
  payload: Record<string, string>;
}

export type ReminderJobStatus = "scheduled" | "sent" | "skipped" | "cancelled";

export interface ReminderJob extends BaseRecord {
  kind: string;
  scheduledFor: IsoTimestamp;
  status: ReminderJobStatus;
  dedupKey: string;
  payload: Record<string, string>;
  timezone: IanaTimezone;
  localDate: LocalDate;
}
