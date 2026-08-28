import type { Task } from "@/core/types";
import { nowIso } from "@/lib/firebase/timestamps";
import { newDocumentId } from "@/repositories/ids";
import { writeTask } from "@/repositories/tasks";
import { emitActivity } from "./activityService";

export async function createTask(input: {
  userId: string;
  title: string;
  localDate: string;
  timezone: string;
  priority: boolean;
}): Promise<Task> {
  const timestamp = nowIso();
  const task: Task = {
    id: newDocumentId(input.userId, "tasks"),
    userId: input.userId,
    title: input.title,
    notes: "",
    status: "open",
    sortOrder: 0,
    dueLocalDate: input.localDate,
    localDate: input.localDate,
    timezone: input.timezone,
    completed: false,
    priority: input.priority,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await writeTask(task);
  await emitActivity({
    userId: input.userId,
    type: "task",
    localDate: input.localDate,
    timezone: input.timezone,
    title: input.title,
    relatedId: task.id,
  });
  return task;
}

export async function toggleTaskComplete(task: Task): Promise<Task> {
  const next: Task = {
    ...task,
    completed: !task.completed,
    updatedAt: nowIso(),
  };
  await writeTask(next);
  if (next.completed && next.localDate) {
    await emitActivity({
      userId: next.userId,
      type: "task",
      localDate: next.localDate,
      timezone: next.timezone,
      title: next.title,
      relatedId: next.id,
    });
  }
  return next;
}

export async function setTaskPriority(task: Task, priority: boolean): Promise<Task> {
  const next: Task = { ...task, priority, updatedAt: nowIso() };
  await writeTask(next);
  return next;
}
