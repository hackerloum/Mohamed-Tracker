import { describe, expect, it } from "vitest";
import { createMemoryActivityRepository } from "@/repositories/memory/activities";
import { createMemorySleepRepository } from "@/repositories/memory/sleep";
import { createSleepService } from "@/services/sleep";

describe("sleep service", () => {
  it("stores auto duration and emits a sleep activity", async () => {
    const sleep = createMemorySleepRepository();
    const activities = createMemoryActivityRepository();
    const api = createSleepService({
      sleep,
      activities,
      now: () => 1_777_000_000_000,
      createId: () => "sleep-1",
      localDateFor: () => "2026-08-28",
    });

    const entry = await api.log({
      userId: "u1",
      timezone: "Africa/Dar_es_Salaam",
      bedtime: "23:00",
      wakeTime: "06:30",
      quality: 4,
      notes: "Woke once",
    });

    expect(entry.durationMinutes).toBe(450);
    expect(entry.localDate).toBe("2026-08-28");

    const events = await activities.listByDate("u1", "2026-08-28");
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("sleep");
  });

  it("returns a weekly average for the last seven local dates", async () => {
    const sleep = createMemorySleepRepository();
    const activities = createMemoryActivityRepository();
    let n = 0;
    const api = createSleepService({
      sleep,
      activities,
      now: () => Date.parse("2026-08-28T12:00:00+03:00"),
      createId: () => `sleep-${++n}`,
      localDateFor: () => "2026-08-28",
    });

    await api.log({
      userId: "u1",
      timezone: "Africa/Dar_es_Salaam",
      bedtime: "23:00",
      wakeTime: "07:00",
      quality: 3,
      localDate: "2026-08-26",
    });
    await api.log({
      userId: "u1",
      timezone: "Africa/Dar_es_Salaam",
      bedtime: "23:00",
      wakeTime: "05:00",
      quality: 2,
      localDate: "2026-08-28",
    });

    const average = await api.weeklyAverage("u1", "2026-08-28");
    expect(average).toBe(420);
  });
});
