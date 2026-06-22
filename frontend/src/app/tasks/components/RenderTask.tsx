import { CalendarClockIcon, CheckCircle2Icon, CircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Task } from "@/app/tasks/types/task"
import DeleteTaskDialog from "@/app/tasks/components/DeleteTaskDialog"
import EditTaskDialog from "@/app/tasks/components/EditTaskDialog"
import { formatTaskDueDateTime } from "@/app/tasks/utils/task-date"

type RenderTaskProps = {
  task: Task
  isEditing: boolean
  onPreviewTask: (task: Task) => void
  startEditingTask: (task: Task) => void
  handleToggleTask: (task: Task) => Promise<void>
  handleDeleteTask: (taskId: string) => Promise<void>
  handleUpdateTask: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  editTitle: string
  editDescription: string
  editDueDate: string
  setEditTitle: React.Dispatch<React.SetStateAction<string>>
  setEditDescription: React.Dispatch<React.SetStateAction<string>>
  setEditDueDate: React.Dispatch<React.SetStateAction<string>>
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>
}

export default function RenderTask({
  task,
  isEditing,
  onPreviewTask,
  startEditingTask,
  handleToggleTask,
  handleDeleteTask,
  handleUpdateTask,
  editTitle,
  editDescription,
  editDueDate,
  setEditTitle,
  setEditDescription,
  setEditDueDate,
  setEditingTaskId,
}: RenderTaskProps) {
  const ToggleIcon = task.completed ? CheckCircle2Icon : CircleIcon

  return (
    <>
      <button
        type="button"
        onClick={() => onPreviewTask(task)}
        className="min-w-0 flex-1 cursor-pointer rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`View details for ${task.title}`}
      >
        <p
          className={
            task.completed
              ? "truncate text-sm font-medium text-muted-foreground line-through transition-colors hover:text-foreground"
              : "truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
          }
        >
          {task.title}
        </p>

        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
          {task.dueDate ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarClockIcon className="size-3.5 shrink-0" />
              <span className="truncate">
                {formatTaskDueDateTime(task.dueDate)}
              </span>
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
      </button>

      <div className="hidden min-w-0 items-center gap-1.5 text-xs text-muted-foreground md:flex">
        {task.dueDate ? (
          <>
            <CalendarClockIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {formatTaskDueDateTime(task.dueDate)}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => handleToggleTask(task)}
        className={
          task.completed
            ? "hidden w-fit bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-500 md:inline-flex"
            : "hidden w-fit bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
        }
        aria-label={
          task.completed
            ? `Mark ${task.title} undone`
            : `Mark ${task.title} done`
        }
        title={task.completed ? "Mark undone" : "Mark done"}
      >
        <ToggleIcon className="size-3" />
        {task.completed ? "Marked" : "Current"}
      </Button>

      <div className="flex shrink-0 items-center justify-end gap-0.5 opacity-70 transition-opacity group-focus-within/task:opacity-100 group-hover/task:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => handleToggleTask(task)}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary md:hidden"
          aria-label={
            task.completed
              ? `Mark ${task.title} undone`
              : `Mark ${task.title} done`
          }
          title={task.completed ? "Mark undone" : "Mark done"}
        >
          <ToggleIcon />
        </Button>
        <EditTaskDialog
          task={task}
          isOpen={isEditing}
          onOpenChange={(open) => {
            if (open) {
              startEditingTask(task)
              return
            }

            setEditingTaskId(null)
          }}
          handleUpdateTask={handleUpdateTask}
          editTitle={editTitle}
          editDescription={editDescription}
          editDueDate={editDueDate}
          setEditTitle={setEditTitle}
          setEditDescription={setEditDescription}
          setEditDueDate={setEditDueDate}
          setEditingTaskId={setEditingTaskId}
        />
        <DeleteTaskDialog
          taskTitle={task.title}
          onDelete={() => handleDeleteTask(task.id)}
        />
      </div>
    </>
  )
}
