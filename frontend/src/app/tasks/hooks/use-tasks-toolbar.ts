import { useState } from "react"
import type { FormEvent } from "react"

type useTasksToolbarProps = {
  handleCreateTask: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleDeleteAllTasks: () => Promise<void>
}

export default function useTasksToolbar({
  handleCreateTask,
  handleDeleteAllTasks,
}: useTasksToolbarProps) {
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

  return {
    isCreateOpen,
    isDeleteAllOpen,
    setIsCreateOpen,
    setIsDeleteAllOpen,
    handleSubmitCreateTask,
    handleConfirmDeleteAllTasks,
    handleCancelCreateTask,
  }
}
