import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"
import {
  getBlankDays,
  getDateKey,
  getMonthDays,
  getMonthKey,
  getMonthLabel,
  isSameDay,
  weekDays,
} from "@/app/calendar/utils/calendar-utils"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

export default function useCalendar(providedTasks?: Task[]) {
  const [loadedTasks, setLoadedTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [previewTask, setPreviewTask] = useState<Task | null>(null)

  const navigate = useNavigate()

  const loadTasks = useCallback(async () => {
    try {
      setError("")

      await apiClient.get("/auth/me")

      const tasks = await getTasks()

      setLoadedTasks(tasks)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login")
        return
      }

      setError(error instanceof Error ? error.message : "Unable to load tasks")
    } finally {
      setIsLoadingTasks(false)
    }
  }, [navigate])

  useEffect(() => {
    if (providedTasks !== undefined) {
      return
    }

    const loadTimer = window.setTimeout(() => void loadTasks(), 0)

    return () => window.clearTimeout(loadTimer)
  }, [loadTasks, providedTasks])

  useEffect(() => {
    if (providedTasks !== undefined) {
      return
    }

    function handleTasksUpdated() {
      void loadTasks()
    }

    window.addEventListener("tasks-updated", handleTasksUpdated)

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated)
    }
  }, [loadTasks, providedTasks])

  const tasks = providedTasks ?? loadedTasks
  const isLoading = providedTasks !== undefined ? false : isLoadingTasks

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const currentMonthKey = getMonthKey(currentYear, currentMonth)
  const currentMonthLabel = getMonthLabel(currentDate)
  const days = getMonthDays(currentYear, currentMonth)
  const blankDays = getBlankDays(currentYear, currentMonth)
  const today = new Date()

  const tasksByDate = useMemo(() => {
    const groupedTasks: Record<string, Task[]> = {}

    for (const task of tasks) {
      if (!task.dueDate) continue

      const dateKey = getDateKey(new Date(task.dueDate))

      groupedTasks[dateKey] = groupedTasks[dateKey] || []
      groupedTasks[dateKey].push(task)
    }

    for (const dateKey of Object.keys(groupedTasks)) {
      groupedTasks[dateKey].sort((firstTask, secondTask) => {
        return (
          new Date(firstTask.dueDate || 0).getTime() -
          new Date(secondTask.dueDate || 0).getTime()
        )
      })
    }

    return groupedTasks
  }, [tasks])

  const hasTasksDueThisMonth = Object.keys(tasksByDate).some((dateKey) =>
    dateKey.startsWith(currentMonthKey)
  )

  function goToPreviousMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  function getTasksForDay(day: Date) {
    return tasksByDate[getDateKey(day)] || []
  }

  return {
    isLoading,
    error,
    previewTask,
    setPreviewTask,
    currentMonthLabel,
    goToPreviousMonth,
    goToNextMonth,
    hasTasksDueThisMonth,
    weekDays,
    blankDays,
    days,
    today,
    isSameDay,
    getTasksForDay,
  }
}
