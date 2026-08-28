import { formatInTimeZone } from "date-fns-tz";
import type { UserProfile } from "../../../src/core/types";
import { DEFAULT_TIMEZONE } from "../../../src/core/dates/localDate";
import {
  isQuietHoursAt,
  underFatigueCap,
} from "../../../src/core/engines/notificationRules";

export interface QuietHoursWindow {
  start: string;
  end: string;
}

export function isQuietHours(nowIso: string, profile: UserProfile): boolean {
  return isQuietHoursAt(
    new Date(nowIso),
    profile.timezone || DEFAULT_TIMEZONE,
    profile.quietHours ?? profile.notificationPrefs.quietHours,
  );
}

export { underFatigueCap };

export function localHour(nowIso: string, timeZone: string = DEFAULT_TIMEZONE): number {
  return Number.parseInt(formatInTimeZone(new Date(nowIso), timeZone, "H"), 10);
}
