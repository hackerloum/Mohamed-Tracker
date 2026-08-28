import { describe, expect, it } from "vitest";
import { nextAction } from "./nextAction";
import type { NextActionContext } from "./nextAction";

const base: NextActionContext = {
  nowHour: 9,
  planned: false,
  prayers: [
    { key: "fajr", completed: false },
    { key: "dhuhr", completed: false },
    { key: "asr", completed: false },
    { key: "maghrib", completed: false },
    { key: "isha", completed: false },
  ],
  habits: [],
  tasks: [],
};

describe("nextAction", () => {
  it("asks to plan the day when it is still before 20:00 and the day is unplanned", () => {
    const action = nextAction(base);
    expect(action).toEqual({
      kind: "plan",
      title: "Plan my day",
      reason: "Set today’s priorities before the evening.",
    });
  });

  it("surfaces an overdue prayer after the plan is set", () => {
    const action = nextAction({
      ...base,
      planned: true,
      nowHour: 10,
    });
    expect(action).toMatchObject({
      kind: "prayer",
      key: "fajr",
      title: "Pray Fajr",
    });
  });

  it("prefers a priority task over incomplete habits", () => {
    const action = nextAction({
      ...base,
      planned: true,
      nowHour: 4,
      prayers: base.prayers.map((prayer) => ({ ...prayer, completed: true })),
      habits: [
        { id: "h1", name: "Read", completed: false, sortOrder: 1 },
      ],
      tasks: [
        {
          id: "t1",
          title: "Call the landlord",
          completed: false,
          priority: true,
        },
      ],
    });
    expect(action).toMatchObject({
      kind: "task",
      taskId: "t1",
      title: "Call the landlord",
    });
  });

  it("picks the first incomplete habit by sort order", () => {
    const action = nextAction({
      ...base,
      planned: true,
      nowHour: 4,
      prayers: base.prayers.map((prayer) => ({ ...prayer, completed: true })),
      habits: [
        { id: "h2", name: "Workout", completed: false, sortOrder: 2 },
        { id: "h1", name: "Study", completed: false, sortOrder: 1 },
      ],
      tasks: [],
    });
    expect(action).toMatchObject({
      kind: "habit",
      habitId: "h1",
      title: "Study",
    });
  });

  it("returns null when nothing is queued", () => {
    const action = nextAction({
      ...base,
      planned: true,
      nowHour: 22,
      prayers: base.prayers.map((prayer) => ({ ...prayer, completed: true })),
      habits: [{ id: "h1", name: "Read", completed: true, sortOrder: 0 }],
      tasks: [
        { id: "t1", title: "Done", completed: true, priority: true },
      ],
    });
    expect(action).toBeNull();
  });
});
