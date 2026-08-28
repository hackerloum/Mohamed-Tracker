import type { StudySession } from "@/core/types/study";
import { startOfMonthDate, startOfWeekMonday } from "@/core/dates/localDate";

export interface TopicMinutes {
  topic: string;
  minutes: number;
}

export interface StudyAnalytics {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  totalHours: number;
  averageSessionMinutes: number;
  sessionCount: number;
  streakDays: number;
  topTopics: TopicMinutes[];
}

export function computeStudyAnalytics(
  sessions: Pick<StudySession, "localDate" | "topic" | "durationMinutes">[],
  today: string,
): StudyAnalytics {
  const weekStart = startOfWeekMonday(today);
  const monthStart = startOfMonthDate(today);
  let todayMinutes = 0;
  let weekMinutes = 0;
  let monthMinutes = 0;
  let totalMinutes = 0;
  const days = new Set<string>();
  const byTopic = new Map<string, number>();

  for (const session of sessions) {
    const minutes = session.durationMinutes;
    totalMinutes += minutes;
    days.add(session.localDate);
    if (session.localDate === today) {
      todayMinutes += minutes;
    }
    if (session.localDate >= weekStart && session.localDate <= today) {
      weekMinutes += minutes;
    }
    if (session.localDate >= monthStart && session.localDate <= today) {
      monthMinutes += minutes;
    }
    const topic = session.topic.trim() || "Study";
    byTopic.set(topic, (byTopic.get(topic) ?? 0) + minutes);
  }

  const sessionCount = sessions.length;
  const topTopics = [...byTopic.entries()]
    .map(([topic, minutes]) => ({ topic, minutes }))
    .sort((a, b) => b.minutes - a.minutes || a.topic.localeCompare(b.topic));

  return {
    todayMinutes,
    weekMinutes,
    monthMinutes,
    totalHours: totalMinutes / 60,
    averageSessionMinutes: sessionCount === 0 ? 0 : Math.round(totalMinutes / sessionCount),
    sessionCount,
    streakDays: consecutiveStreak(days, today),
    topTopics,
  };
}

function consecutiveStreak(days: Set<string>, today: string): number {
  if (!days.has(today)) {
    return 0;
  }
  let streak = 0;
  let cursor = today;
  while (days.has(cursor)) {
    streak += 1;
    cursor = previousLocalDate(cursor);
  }
  return streak;
}

function previousLocalDate(localDate: string): string {
  const [year, month, day] = localDate.split("-").map(Number);
  const utc = Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) - 1);
  const next = new Date(utc);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
