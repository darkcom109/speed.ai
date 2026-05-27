import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getWeather } from "@/app/dashboard/api/weather-api"
import WeatherCard from "@/app/dashboard/components/WeatherCard"
import type { Weather } from "@/app/dashboard/types/weather"

export default function DashboardPage() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [weatherError, setWeatherError] = useState("")
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)

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

          <WeatherCard
            weather={weather}
            error={weatherError}
            isLoading={isWeatherLoading}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
