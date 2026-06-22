import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"
import axios from "axios"

import {
  createTask,
  deleteAllTasks,
  deleteTask,
  getTasks,
  updateTask,
} from "@/app/tasks/api/tasks-api"
import type { Task, TaskFilter } from "@/app/tasks/types"
import { toDateTimeLocalValue } from "@/app/tasks/utils/task-date"
import {
  emitTasksUpdated,
  getPageCount,
  getPaginatedTasks,
  matchesTaskFilter,
} from "@/app/tasks/utils/task-utils"

const tasksPerPage = 10

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

  const [searchTerm, setSearchTerm] = useState("")

  const [activePage, setActivePage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all")

  const navigate = useNavigate()

  const search = searchTerm.toLowerCase()
  const searchedTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search)
  )
  const filteredTasks = searchedTasks.filter((task) =>
    matchesTaskFilter(task, taskFilter)
  )
  const activeTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)
  const activePageCount = getPageCount(activeTasks.length, tasksPerPage)
  const completedPageCount = getPageCount(completedTasks.length, tasksPerPage)
  const visibleActivePage = Math.min(activePage, activePageCount)
  const visibleCompletedPage = Math.min(completedPage, completedPageCount)
  const paginatedActiveTasks = getPaginatedTasks(
    activeTasks,
    visibleActivePage,
    tasksPerPage
  )
  const paginatedCompletedTasks = getPaginatedTasks(
    completedTasks,
    visibleCompletedPage,
    tasksPerPage
  )

  const loadTasks = useCallback(async () => {
    try {
      const tasks = await getTasks()

      setTasks(tasks)
      setError("")
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login")
        return
      }

      setError(
        error instanceof Error ? error.message : "Unable to retrieve tasks"
      )
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    let shouldIgnore = false

    getTasks()
      .then((loadedTasks) => {
        if (!shouldIgnore) {
          setTasks(loadedTasks)
          setError("")
        }
      })
      .catch((error: unknown) => {
        if (shouldIgnore) {
          return
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate("/login")
          return
        }

        setError(
          error instanceof Error ? error.message : "Unable to retrieve tasks"
        )
      })
      .finally(() => {
        if (!shouldIgnore) {
          setIsLoading(false)
        }
      })

    return () => {
      shouldIgnore = true
    }
  }, [navigate])

  useEffect(() => {
    function handleTasksUpdated() {
      void loadTasks()
    }

    window.addEventListener("tasks-updated", handleTasksUpdated)

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated)
    }
  }, [loadTasks])

  function handleSearchTermChange(value: string) {
    setSearchTerm(value)
    setActivePage(1)
    setCompletedPage(1)
  }

  function handleTaskFilterChange(value: TaskFilter) {
    setTaskFilter(value)
    setActivePage(1)
    setCompletedPage(1)
  }

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
      emitTasksUpdated()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create task")
    }
  }

  async function handleDeleteAllTasks() {
    try {
      setError("")

      await deleteAllTasks()
      setTasks((currentTasks) => currentTasks.filter((task) => task.completed))
      emitTasksUpdated()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete all tasks"
      )
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
      emitTasksUpdated()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task")
    }
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditDueDate(task.dueDate ? toDateTimeLocalValue(task.dueDate) : "")
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
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
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
      emitTasksUpdated()
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
      emitTasksUpdated()
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
    searchTerm,
    activePage: visibleActivePage,
    completedPage: visibleCompletedPage,
    taskFilter,
    activeTasks,
    completedTasks,
    paginatedActiveTasks,
    paginatedCompletedTasks,
    activePageCount,
    completedPageCount,
    tasksPerPage,
    setTitle,
    setDescription,
    setDueDate,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditingTaskId,
    setSearchTerm: handleSearchTermChange,
    handleCreateTask,
    handleToggleTask,
    startEditingTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteAllTasks,
    setActivePage,
    setCompletedPage,
    setTaskFilter: handleTaskFilterChange,
  }
}
