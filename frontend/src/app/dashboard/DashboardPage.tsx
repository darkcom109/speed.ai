import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getNextHoliday } from "@/app/dashboard/api/holiday-api"
import { getWeather } from "@/app/dashboard/api/weather-api"
import DashboardQuickInfo from "@/app/dashboard/components/DashboardQuickInfo"
import DailyBriefCard from "@/app/dashboard/components/DailyBriefCard"
import FinanceSnapshotCard from "@/app/dashboard/components/FinanceSnapshotCard"
import TaskActivityChart from "@/app/dashboard/components/TaskActivityChart"
import TaskSummaryCard from "@/app/dashboard/components/TaskSummaryCard"
import TodayTasksCard from "@/app/dashboard/components/TodayTasksCard"
import type { Holiday } from "@/app/dashboard/types/holiday"
import type { Weather } from "@/app/dashboard/types/weather"
import { getExpenses } from "@/app/expenses/api/expenses-api"
import type { Expense } from "@/app/expenses/types/expense"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"

export default function DashboardPage() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  const [holiday, setHoliday] = useState<Holiday | null>(null)
  const [isHolidayLoading, setIsHolidayLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksError, setTasksError] = useState("")
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesError, setExpensesError] = useState("")
  const [isExpensesLoading, setIsExpensesLoading] = useState(true)

  const navigate = useNavigate()

  function loadWeather() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await getWeather(
            position.coords.latitude,
            position.coords.longitude
          )

          setWeather(weather)
        } catch {
          setWeather(null)
        } finally {
          setIsWeatherLoading(false)
        }
      },
      () => {
        setIsWeatherLoading(false)
      }
    )
  }

  async function loadHoliday() {
    try {
      const holiday = await getNextHoliday("US")

      setHoliday(holiday)
    } catch {
      setHoliday(null)
    } finally {
      setIsHolidayLoading(false)
    }
  }

  async function loadTasks() {
    try {
      const tasks = await getTasks()

      setTasks(tasks)
    } catch (error) {
      setTasksError("Unable to load tasks")
    } finally {
      setIsTasksLoading(false)
    }
  }

  async function loadExpenses() {
    try {
      const expenses = await getExpenses()

      setExpenses(expenses)
    } catch (error) {
      setExpensesError("Unable to load finances")
    } finally {
      setIsExpensesLoading(false)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        navigate("/login")
        return
      }

      loadWeather()
      loadHoliday()
      loadTasks()
      loadExpenses()
    }

    checkAuth()
  }, [navigate])

  useEffect(() => {
    function handleTasksUpdated() {
      void loadTasks()
    }

    function handleFinancesUpdated() {
      void loadExpenses()
    }

    window.addEventListener("tasks-updated", handleTasksUpdated)
    window.addEventListener("finances-updated", handleFinancesUpdated)

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated)
      window.removeEventListener("finances-updated", handleFinancesUpdated)
    }
  }, [])

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
        <SiteHeader title="Dashboard" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                A live overview of your workspace.
              </p>
            </div>

            <DashboardQuickInfo
              weather={weather}
              holiday={holiday}
              isWeatherLoading={isWeatherLoading}
              isHolidayLoading={isHolidayLoading}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <DailyBriefCard
              tasks={tasks}
              expenses={expenses}
              isLoading={isTasksLoading || isExpensesLoading}
            />
            <FinanceSnapshotCard
              expenses={expenses}
              error={expensesError}
              isLoading={isExpensesLoading}
            />
          </div>

          <TaskActivityChart
            tasks={tasks}
            error={tasksError}
            isLoading={isTasksLoading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TaskSummaryCard
              tasks={tasks}
              error={tasksError}
              isLoading={isTasksLoading}
            />
            <TodayTasksCard
              tasks={tasks}
              error={tasksError}
              isLoading={isTasksLoading}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
