import { useState } from "react"
import type { FormEvent } from "react"
import { Trash2 } from "lucide-react"

import TaskFormDialog from "@/app/tasks/components/TaskFormDialog"
import { type TasksToolbarProps } from "@/app/tasks/types/tasks-toolbar-props"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DeleteAllTasksDialog from "./DeleteAllTasksDialog"

export default function TasksToolbar({
  handleCreateTask,
  handleDeleteAllTasks,
  title,
  description,
  dueDate,
  setTitle,
  setDescription,
  setDueDate,
  searchTerm,
  setSearchTerm,
}: TasksToolbarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)

  async function handleSubmitCreateTask(event: FormEvent<HTMLFormElement>) {
    await handleCreateTask(event)
    setIsCreateOpen(false)
  }

  async function handleConfirmDeleteAllTasks() {
    await handleDeleteAllTasks()
    setIsDeleteAllOpen(false)
  }

  function handleCancelCreateTask() {
    setIsCreateOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row">
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search tasks..."
      />

      <div className="flex gap-2">
        <TaskFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button type="button" className="flex-1 sm:w-28 sm:flex-none">
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

        <DeleteAllTasksDialog 
          isDeleteAllOpen={isDeleteAllOpen}
          setIsDeleteAllOpen={setIsDeleteAllOpen}
          handleConfirmDeleteAllTasks={handleConfirmDeleteAllTasks}
        />
        
        <Button
          type="button"
          variant="destructive"
          className="flex-1 sm:w-32 sm:flex-none"
          onClick={() => setIsDeleteAllOpen(true)}
        >
          <Trash2/>
          Delete all
        </Button>
      </div>
    </div>
  )
}
