import { CheckIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Task } from "@/app/tasks/types/task"
import DeleteTaskDialog from "@/app/tasks/components/DeleteTaskDialog"
import EditTaskDialog from "@/app/tasks/components/EditTaskDialog"
import { formatTaskDueDateTime } from "@/app/tasks/utils/task-date"

type RenderTaskProps = {
  task: Task
  isEditing: boolean
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
  const ToggleIcon = task.completed ? RotateCcwIcon : CheckIcon

  return (
    <>
      <div>
        <p
          className={
            task.completed
              ? "font-medium text-muted-foreground line-through"
              : "font-medium"
          }
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Due {formatTaskDueDateTime(task.dueDate)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
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
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => handleToggleTask(task)}
          aria-label={
            task.completed ? `Mark ${task.title} undone` : `Mark ${task.title} done`
          }
          title={task.completed ? "Mark undone" : "Mark done"}
        >
          <ToggleIcon />
        </Button>
        <DeleteTaskDialog
          taskTitle={task.title}
          onDelete={() => handleDeleteTask(task.id)}
        />
      </div>
    </>
  )
}
