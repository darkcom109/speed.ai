import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())

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
      }
      catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load tasks")
      }
      finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [navigate])

  const datedTasks = tasks.filter((task) => task.dueDate)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
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

  function isSameDay(firstDate: Date, secondDate: Date) {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    )
  }

  function getTasksForDay(day: Date) {
    return datedTasks.filter((task) => {
      if (!task.dueDate) return false

      const taskDate = new Date(task.dueDate)

      return isSameDay(taskDate, day)
    })
  }

  const tasksDueThisMonth = datedTasks.filter((task) => {
    if (!task.dueDate) return false

    const taskDate = new Date(task.dueDate)

    return (
      taskDate.getFullYear() === currentYear &&
      taskDate.getMonth() === currentMonth
    )
  })

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
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Calendar</h2>
            <p className="text-sm text-muted-foreground">
              A mini calendar will live here.
            </p>
          </div>

          {isLoading && <p>Loading calendar...</p>}

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

          {!isLoading && !error && tasksDueThisMonth.length === 0 && (
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
              const visibleTasks = tasksForDay.slice(0, 3)
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
                  <p
                    className={
                      isSameDay(day, today)
                        ? "inline-flex size-7 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                        : "text-sm font-medium"
                    }
                  >
                    {day.getDate()}
                  </p>
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={
                        task.completed
                          ? "mt-2 truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground line-through"
                          : "mt-2 truncate rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                      }
                    >
                      {task.title}
                    </div>
                  ))}
                  {hiddenTaskCount > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      +{hiddenTaskCount} more
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
