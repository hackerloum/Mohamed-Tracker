import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";

export function TaskDetailScreen({ taskId }: { taskId: string }) {
  return (
    <Screen>
      <AppHeader title="Task" />
      <EmptyState
        title="This task is not available."
        detail={`No task with id ${taskId} is stored yet.`}
      />
      <Link href="/today">
        <Button variant="ghost">Back to Today</Button>
      </Link>
    </Screen>
  );
}
