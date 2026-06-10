import { ClockIcon } from "lucide-react"
import { formatArrivalTime } from "@/app/transport/utils/transport-station-utils"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"

type StationArrivalsPanelProps = {
  selectedStation: TflStation | null
  arrivals: TflArrival[]
  arrivalsByDirection: Record<string, TflArrival[]>
  isLoadingArrivals: boolean
}

export default function StationArrivalsPanel({
  selectedStation,
  arrivals,
  arrivalsByDirection,
  isLoadingArrivals,
}: StationArrivalsPanelProps) {
  return (
    <section className="flex h-[min(34rem,calc(100vh-17rem))] min-h-80 flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">
            {selectedStation ? selectedStation.name : "Arrivals"}
          </h3>
          {selectedStation && (
            <p className="text-xs text-muted-foreground">
              {arrivals.length} upcoming arrivals
            </p>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {isLoadingArrivals && (
          <p className="text-sm text-muted-foreground">Loading arrivals...</p>
        )}

        {!selectedStation && !isLoadingArrivals && (
          <p className="text-sm text-muted-foreground">
            Select a station to view incoming trains.
          </p>
        )}

        {selectedStation && !isLoadingArrivals && arrivals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No arrivals available right now.
          </p>
        )}

        {!isLoadingArrivals && arrivals.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            {Object.entries(arrivalsByDirection).map(
              ([direction, arrivals]) => (
                <div
                  key={direction}
                  className="overflow-hidden rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
                    <ClockIcon className="size-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium capitalize">
                      {direction}
                    </h4>
                  </div>
                  <div className="divide-y">
                    {arrivals.slice(0, 8).map((arrival) => (
                      <div
                        key={arrival.id}
                        className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <p className="truncate font-medium">
                              {arrival.lineName}
                            </p>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {arrival.destinationName}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {formatArrivalTime(arrival.timeToStation)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
