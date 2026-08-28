import { describe, expect, it } from "vitest";
import { createMemoryActivityRepository } from "@/repositories/memory/activities";
import { createMemoryGoalRepository } from "@/repositories/memory/goals";
import { createGoalService } from "@/services/goals";

function service() {
  const goals = createMemoryGoalRepository();
  const activities = createMemoryActivityRepository();
  return {
    goals,
    activities,
    api: createGoalService({
      goals,
      activities,
      now: () => 1_777_000_000_000,
      createId: () => "goal-1",
      localDateFor: () => "2026-08-28",
    }),
  };
}

describe("goal service", () => {
  it("creates a goal and emits a goal activity", async () => {
    const { api, activities } = service();

    const created = await api.create({
      userId: "u1",
      timezone: "Africa/Dar_es_Salaam",
      title: "Read 12 books",
      description: "Quiet winter reading",
      type: "count",
      target: 12,
      current: 0,
      deadline: "2026-12-31",
    });

    expect(created.progressPercent).toBe(0);
    expect(created.status).toBe("active");

    const events = await activities.listByDate("u1", "2026-08-28");
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("goal");
  });

  it("updates progress, percent, milestones, and auto-completes", async () => {
    const { api } = service();

    await api.create({
      userId: "u1",
      timezone: "Africa/Dar_es_Salaam",
      title: "Workout 100 times",
      description: "",
      type: "count",
      target: 100,
      current: 40,
      milestones: [{ id: "m1", title: "Halfway", targetValue: 50 }],
    });

    const updated = await api.setProgress("u1", "goal-1", 100);

    expect(updated.progressPercent).toBe(100);
    expect(updated.status).toBe("completed");
    expect(updated.milestones[0]?.reachedAt).toBe(1_777_000_000_000);
  });
});
