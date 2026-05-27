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
import HolidayCard from "@/app/dashboard/components/HolidayCard"
import TaskActivityChart from "@/app/dashboard/components/TaskActivityChart"
import TaskSummaryCard from "@/app/dashboard/components/TaskSummaryCard"
import WeatherCard from "@/app/dashboard/components/WeatherCard"
import type { Holiday } from "@/app/dashboard/types/holiday"
import type { Weather } from "@/app/dashboard/types/weather"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"

export default function DashboardPage() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [weatherError, setWeatherError] = useState("")
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  const [holiday, setHoliday] = useState<Holiday | null>(null)
  const [holidayError, setHolidayError] = useState("")
  const [isHolidayLoading, setIsHolidayLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksError, setTasksError] = useState("")
  const [isTasksLoading, setIsTasksLoading] = useState(true)

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
        } catch (error) {
          setWeatherError(
            "Unable to load weather"
          )
        } finally {
          setIsWeatherLoading(false)
        }
      },
      () => {
        setWeatherError("Location permission denied")
        setIsWeatherLoading(false)
      }
    )
  }

  async function loadHoliday() {
    try {
      const holiday = await getNextHoliday("US")

      setHoliday(holiday)
    } catch (error) {
      setHolidayError(
        "Unable to load holiday"
      )
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
    }

    checkAuth()
  }, [navigate])

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
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Your personal overview will live here.
            </p>
          </div>

          <TaskActivityChart
            tasks={tasks}
            error={tasksError}
            isLoading={isTasksLoading}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <WeatherCard
              weather={weather}
              error={weatherError}
              isLoading={isWeatherLoading}
            />
            <HolidayCard
              holiday={holiday}
              error={holidayError}
              isLoading={isHolidayLoading}
            />
            <TaskSummaryCard
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
