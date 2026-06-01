import { CalendarClockIcon, CloudSunIcon } from "lucide-react"

import type { Holiday } from "@/app/dashboard/types/holiday"
import type { Weather } from "@/app/dashboard/types/weather"

type DashboardQuickInfoProps = {
  weather: Weather | null
  holiday: Holiday | null
  isWeatherLoading: boolean
  isHolidayLoading: boolean
}

export default function DashboardQuickInfo({
  weather,
  holiday,
  isWeatherLoading,
  isHolidayLoading,
}: DashboardQuickInfoProps) {
  const holidayDate = holiday
    ? new Date(holiday.date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : null

  return (
    <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
      <div className="inline-flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm">
        <CloudSunIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="font-medium">
          {isWeatherLoading
            ? "Loading"
            : weather
              ? `${Math.round(weather.temperature)}\u00b0`
              : "Unavailable"}
        </span>
        {weather && !isWeatherLoading ? (
          <span className="text-muted-foreground">
            Rain {weather.rainChance}% · {weather.precipitation}mm
          </span>
        ) : null}
      </div>

      <div className="inline-flex h-9 min-w-0 items-center gap-2 rounded-md border bg-card px-3 text-sm">
        <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">
          {isHolidayLoading
            ? "Loading"
            : holiday
              ? holiday.localName
              : "Unavailable"}
        </span>
        {holiday && !isHolidayLoading ? (
          <span className="shrink-0 text-muted-foreground">{holidayDate}</span>
        ) : null}
      </div>
    </div>
  )
}
