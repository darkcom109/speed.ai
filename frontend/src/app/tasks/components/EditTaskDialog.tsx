import type { Dispatch, FormEvent, SetStateAction } from "react"

import TaskFormDialog from "@/app/tasks/components/TaskFormDialog"
import { type Task } from "@/app/tasks/types/task"
import { Button } from "@/components/ui/button"

type EditTaskDialogProps = {
  task: Task
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  handleUpdateTask: (event: FormEvent<HTMLFormElement>) => Promise<void>
  editTitle: string
  editDescription: string
  editDueDate: string
  setEditTitle: Dispatch<SetStateAction<string>>
  setEditDescription: Dispatch<SetStateAction<string>>
  setEditDueDate: Dispatch<SetStateAction<string>>
  setEditingTaskId: Dispatch<SetStateAction<string | null>>
}

export default function EditTaskDialog({
  task,
  isOpen,
  onOpenChange,
  handleUpdateTask,
  editTitle,
  editDescription,
  editDueDate,
  setEditTitle,
  setEditDescription,
  setEditDueDate,
  setEditingTaskId,
}: EditTaskDialogProps) {
  return (
    <TaskFormDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      trigger={
        <Button type="button" variant="outline" size="sm">
          Edit
        </Button>
      }
      title="Edit task"
      description={`Update "${task.title}".`}
      submitLabel="Save"
      taskTitle={editTitle}
      taskDescription={editDescription}
      taskDueDate={editDueDate}
      setTaskTitle={setEditTitle}
      setTaskDescription={setEditDescription}
      setTaskDueDate={setEditDueDate}
      onSubmit={handleUpdateTask}
      onCancel={() => setEditingTaskId(null)}
    />
  )
}
