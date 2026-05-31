import { useEffect, useState } from "react"
import { CalendarCheckIcon } from "lucide-react"

import type { Task } from "@/app/tasks/types/task"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type CalendarTaskPreviewDialogProps = {
  task: Task | null
  onOpenChange: (open: boolean) => void
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export default function CalendarTaskPreviewDialog({
  task,
  onOpenChange,
}: CalendarTaskPreviewDialogProps) {
  const [displayTask, setDisplayTask] = useState<Task | null>(task)

  useEffect(() => {
    if (task) {
      setDisplayTask(task)
    }
  }, [task])

  return (
    <AlertDialog open={!!task} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 text-left">
          <AlertDialogMedia className="bg-primary/10 text-primary">
            <CalendarCheckIcon />
          </AlertDialogMedia>
          <div className="space-y-3">
            <AlertDialogTitle>{displayTask?.title}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  {displayTask?.description || "No description added for this task."}
                </p>
                <div className="grid gap-1 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Due: </span>
                    {displayTask?.dueDate
                      ? dateFormatter.format(new Date(displayTask.dueDate))
                      : "No due date"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status: </span>
                    {displayTask?.completed ? "Completed" : "Current"}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
