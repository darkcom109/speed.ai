import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"
import { Button } from "@/components/ui/button"
import CalendarTaskPreviewDialog from "@/app/calendar/components/CalendarTaskPreviewDialog"

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [previewTask, setPreviewTask] = useState<Task | null>(null)

  const navigate = useNavigate()

  const loadTasks = useCallback(async () => {
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
    }
    catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load tasks")
    }
    finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  useEffect(() => {
    function handleTasksUpdated() {
      void loadTasks()
    }

    window.addEventListener("tasks-updated", handleTasksUpdated)

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated)
    }
  }, [loadTasks])

  const tasksByDate = useMemo(() => {
    const groupedTasks: Record<string, Task[]> = {}

    for (const task of tasks) {
      if (!task.dueDate) continue

      const dateKey = getDateKey(new Date(task.dueDate))

      groupedTasks[dateKey] = groupedTasks[dateKey] || []
      groupedTasks[dateKey].push(task)
    }

    return groupedTasks
  }, [tasks])

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
  const currentMonthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  function goToPreviousMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    return new Date(currentYear, currentMonth, index + 1)
  })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const blankDays = Array.from({ length: firstDayOfMonth })
  const today = new Date()
  const hasTasksDueThisMonth = Object.keys(tasksByDate).some((dateKey) =>
    dateKey.startsWith(currentMonthKey)
  )

  function getDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  function isSameDay(firstDate: Date, secondDate: Date) {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    )
  }

  function getTasksForDay(day: Date) {
    return tasksByDate[getDateKey(day)] || []
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Calendar" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goToPreviousMonth}>
              Previous
            </Button>

            <h3 className="text-base font-semibold">{currentMonthLabel}</h3>

            <Button type="button" variant="outline" onClick={goToNextMonth}>
              Next
            </Button>
          </div>

          {!isLoading && !error && !hasTasksDueThisMonth && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No tasks due this month.
            </p>
          )}
          
          <div className="grid grid-cols-7">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="px-2 py-2 text-xs font-medium text-muted-foreground"
              >
                {weekDay}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 rounded-lg border bg-card">
            {blankDays.map((_, index) => (
              <div key={`blank-${index}`} className="h-36 border p-2" />
            ))}

            {days.map((day) => {
              const tasksForDay = getTasksForDay(day)
              const visibleTasks = tasksForDay.slice(0, 2)
              const hiddenTaskCount = tasksForDay.length - visibleTasks.length

              return (
                <div
                  key={day.toISOString()}
                  className={
                    isSameDay(day, today)
                      ? "h-36 overflow-hidden border bg-accent/40 p-2"
                      : "h-36 overflow-hidden border p-2"
                  }
                >
                  <div className="mb-2 flex h-6 items-start">
                    <p
                      className={
                        isSameDay(day, today)
                          ? "grid size-6 place-items-center rounded-full bg-primary text-xs font-medium leading-none text-primary-foreground"
                          : "h-6 text-sm font-medium leading-6"
                      }
                    >
                      {day.getDate()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {visibleTasks.map((task) => (
                      <button
                        type="button"
                        key={task.id}
                        className={
                          task.completed
                            ? "w-full cursor-pointer truncate rounded-md bg-muted px-2 py-0.5 text-left text-xs leading-4 text-muted-foreground line-through transition hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            : "w-full cursor-pointer truncate rounded-md bg-primary px-2 py-0.5 text-left text-xs leading-4 text-primary-foreground transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        }
                        onClick={() => setPreviewTask(task)}
                      >
                        {task.title}
                      </button>
                    ))}
                    {hiddenTaskCount > 0 && (
                      <p className="px-1 text-xs leading-4 text-muted-foreground">
                        +{hiddenTaskCount} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <CalendarTaskPreviewDialog
            task={previewTask}
            onOpenChange={(open) => {
              if (!open) {
                setPreviewTask(null)
              }
            }}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
