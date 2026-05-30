import { useState } from "react"
import type { FormEvent } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type CreateTaskProps } from "../types/create-task-props"
import TaskFormDialog from "@/app/tasks/components/TaskFormDialog"

export default function CreateTask({
  handleCreateTask,
  title,
  description,
  dueDate,
  setTitle,
  setDescription,
  setDueDate,
}: CreateTaskProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function handleSubmitCreateTask(event: FormEvent<HTMLFormElement>) {
    await handleCreateTask(event)
    setIsCreateOpen(false)
  }

  function handleCancelCreateTask() {
    setIsCreateOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row">
      <Input placeholder="Search tasks..." />

      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        trigger={
          <Button type="button" className="sm:w-28">
            Add task
          </Button>
        }
        title="Add task"
        description="Create a new task."
        submitLabel="Add task"
        taskTitle={title}
        taskDescription={description}
        taskDueDate={dueDate}
        setTaskTitle={setTitle}
        setTaskDescription={setDescription}
        setTaskDueDate={setDueDate}
        onSubmit={handleSubmitCreateTask}
        onCancel={handleCancelCreateTask}
      />
    </div>
  )
}
