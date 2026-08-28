import type { NextAction } from "./nextAction";

export type NotificationKind =
  | "morningBriefing"
  | "eveningReview"
  | "weeklyReview"
  | "habitReminder"
  | "prayerReminder"
  | "budgetAlert"
  | "goalAlert"
  | "nextAction";

export interface NotificationTemplate {
  title: string;
  body: string;
}

export function deepLinkFor(action: NextAction | null, kind?: string): string {
  if (action?.kind === "plan") return "/today/plan";
  if (action?.kind === "prayer") return "/today";
  if (action?.kind === "habit") return "/today";
  if (action?.kind === "task") return `/today/task/${action.taskId}`;
  if (kind === "weeklyReview") return "/insights/week";
  if (kind === "eveningReview") return "/today/reflection";
  if (kind === "morningBriefing") return "/today";
  if (kind === "budgetAlert") return "/money";
  if (kind === "goalAlert") return "/more/goals";
  return "/today";
}

export function templateFor(kind: string, action: NextAction | null): NotificationTemplate {
  if (action) {
    return { title: action.title, body: action.reason };
  }
  if (kind === "morningBriefing") {
    return { title: "Morning briefing", body: "Open Today for the next action." };
  }
  if (kind === "eveningReview") {
    return { title: "Evening review", body: "Log reflection before the day closes." };
  }
  if (kind === "weeklyReview") {
    return { title: "Weekly review", body: "This week’s numbers are ready." };
  }
  if (kind === "budgetAlert") {
    return { title: "Budget", body: "A budget is over its stored limit." };
  }
  if (kind === "goalAlert") {
    return { title: "Goal", body: "A goal just reached its stored target." };
  }
  return { title: kind, body: "" };
}
