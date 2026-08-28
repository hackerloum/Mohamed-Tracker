import { TaskDetailScreen } from "@/features/today/TaskDetailScreen";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskDetailScreen taskId={taskId} />;
}
