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
import WeatherCard from "@/app/dashboard/components/WeatherCard"
import type { Holiday } from "@/app/dashboard/types/holiday"
import type { Weather } from "@/app/dashboard/types/weather"

export default function DashboardPage() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [weatherError, setWeatherError] = useState("")
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
  const [holiday, setHoliday] = useState<Holiday | null>(null)
  const [holidayError, setHolidayError] = useState("")
  const [isHolidayLoading, setIsHolidayLoading] = useState(true)

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
            error instanceof Error ? error.message : "Unable to load weather"
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
        error instanceof Error ? error.message : "Unable to load holiday"
      )
    } finally {
      setIsHolidayLoading(false)
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,24rem)_minmax(0,24rem)]">
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
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
