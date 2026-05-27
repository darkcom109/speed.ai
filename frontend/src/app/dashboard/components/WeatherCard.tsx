import {
  CloudDrizzleIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  SunIcon,
} from "lucide-react"

import type { Weather } from "@/app/dashboard/types/weather"

type WeatherCardProps = {
  weather: Weather | null
  error: string
  isLoading: boolean
}

function getWeatherIcon(weatherCode: number) {
  if (weatherCode === 0) return SunIcon
  if ([1, 2, 3].includes(weatherCode)) return CloudIcon
  if ([45, 48].includes(weatherCode)) return CloudFogIcon
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return CloudDrizzleIcon
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return CloudRainIcon
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return CloudSnowIcon
  if ([95, 96, 99].includes(weatherCode)) return CloudLightningIcon

  return CloudIcon
}

export default function WeatherCard({
  weather,
  error,
  isLoading,
}: WeatherCardProps) {
  return (
    <section className="w-full max-w-xs rounded-lg border bg-card p-3">
      <h3 className="text-sm font-medium">Weather</h3>

      {isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {weather && (() => {
        const WeatherIcon = getWeatherIcon(weather.weatherCode)

        return (
          <div className="mt-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <WeatherIcon className="size-5" />
              </div>
              <p className="text-2xl font-semibold">
                {weather.temperature} degrees
              </p>
            </div>
          <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            <p>Rain chance: {weather.rainChance}%</p>
            <p>Precipitation: {weather.precipitation}mm</p>
            <p>{weather.timezone}</p>
          </div>
          </div>
        )
      })()}
    </section>
  )
}
