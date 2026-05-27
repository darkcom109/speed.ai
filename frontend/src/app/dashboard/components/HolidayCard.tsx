import { CalendarDaysIcon } from "lucide-react"

import type { Holiday } from "@/app/dashboard/types/holiday"

type HolidayCardProps = {
  holiday: Holiday | null
  error: string
  isLoading: boolean
}

export default function HolidayCard({
  holiday,
  error,
  isLoading,
}: HolidayCardProps) {
  return (
    <section className="min-h-36 w-full rounded-lg border bg-card p-3">
      <h3 className="text-sm font-medium">Next holiday</h3>

      {isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {!isLoading && !error && !holiday && (
        <p className="mt-2 text-sm text-muted-foreground">No holidays found.</p>
      )}

      {holiday && (
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CalendarDaysIcon className="size-5" />
            </div>
            <p className="line-clamp-2 min-w-0 text-xl font-semibold leading-tight">
              {holiday.localName}
            </p>
          </div>
          <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            <p className="line-clamp-1">{holiday.name}</p>
            <p>
              Date:{" "}
              {new Date(holiday.date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p>Country: {holiday.countryCode}</p>
          </div>
        </div>
      )}
    </section>
  )
}
