import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    async function loadTasks() {
      try {
        setError("")

        const response = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          navigate("/login")
          return
        }

        const tasks = await getTasks()
        setTasks(tasks)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to retrieve tasks")
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [navigate])

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError("")

      const task = await createTask({
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      })

      setTasks((currentTasks) => [task, ...currentTasks])
      setTitle("")
      setDescription("")
      setDueDate("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create task")
    }
  }

  async function handleToggleTask(task: Task) {
    try {
      setError("")

      const updatedTask = await updateTask(task.id, {
        completed: !task.completed,
      })

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask
        )
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task")
    }
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "")
  }

  async function handleUpdateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingTaskId) {
      return
    }

    try {
      setError("")

      const updatedTask = await updateTask(editingTaskId, {
        title: editTitle,
        description: editDescription || undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      })

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )

      setEditingTaskId(null)
      setEditTitle("")
      setEditDescription("")
      setEditDueDate("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task")
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      setError("")

      await deleteTask(taskId)

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete task")
    }
  }

  return {
    tasks,
    error,
    isLoading,
    editingTaskId,
    editTitle,
    editDescription,
    editDueDate,
    title,
    description,
    dueDate,
    setTitle,
    setDescription,
    setDueDate,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditingTaskId,
    handleCreateTask,
    handleToggleTask,
    startEditingTask,
    handleUpdateTask,
    handleDeleteTask,
  }
}
