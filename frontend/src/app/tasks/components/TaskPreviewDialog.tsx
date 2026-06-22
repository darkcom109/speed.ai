import { CalendarClockIcon, ListChecksIcon } from "lucide-react"

import type { Task } from "@/app/tasks/types/task"
import { formatTaskDueDateTime } from "@/app/tasks/utils/task-date"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type TaskPreviewDialogProps = {
  task: Task | null
  onOpenChange: (open: boolean) => void
}

export default function TaskPreviewDialog({
  task,
  onOpenChange,
}: TaskPreviewDialogProps) {
  if (!task) {
    return null
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-8">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ListChecksIcon className="size-4" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-lg leading-6">
                {task.title}
              </DialogTitle>
              <DialogDescription>
                Task details and current status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Description
            </p>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
              {task.description || "No description added for this task."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Due date
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                <CalendarClockIcon className="size-4 text-muted-foreground" />
                {task.dueDate
                  ? formatTaskDueDateTime(task.dueDate)
                  : "No due date"}
              </p>
            </div>

            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <p className="mt-1 text-sm">
                {task.completed ? "Marked as done" : "Current"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
