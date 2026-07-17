import {
  Clock3Icon,
  LoaderCircleIcon,
  MapPinIcon,
  TrainFrontIcon,
} from "lucide-react"
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
    <section className="flex h-[min(38rem,calc(100vh-15rem))] min-h-96 flex-col">
      <div className="flex min-h-[3.25rem] items-center justify-between gap-3 border-b px-5 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">
            {selectedStation ? selectedStation.name : "Arrivals"}
          </h3>
          {selectedStation && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {arrivals.length} upcoming arrivals
            </p>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {isLoadingArrivals && (
          <div className="flex h-full min-h-64 items-center justify-center">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Loading live arrivals...
            </p>
          </div>
        )}

        {!selectedStation && !isLoadingArrivals && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
            <div className="flex size-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
              <MapPinIcon className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium">Choose a station</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a station to view incoming trains.
            </p>
          </div>
        )}

        {selectedStation && !isLoadingArrivals && arrivals.length === 0 && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
            <TrainFrontIcon className="size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No upcoming services</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No arrivals available right now.
            </p>
          </div>
        )}

        {!isLoadingArrivals && arrivals.length > 0 && (
          <div className="divide-y">
            {Object.entries(arrivalsByDirection).map(
              ([direction, arrivals]) => (
                <section key={direction} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 pb-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Clock3Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <h4 className="truncate text-sm font-semibold capitalize">
                        {direction}
                      </h4>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {Math.min(arrivals.length, 8)} services
                    </span>
                  </div>
                  <div className="divide-y border-y">
                    {arrivals.slice(0, 8).map((arrival) => (
                      <div
                        key={arrival.id}
                        className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-1 py-2.5 sm:grid-cols-[minmax(8rem,0.75fr)_minmax(10rem,1.25fr)_5rem]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <TrainFrontIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          <p className="truncate font-medium">
                            {arrival.lineName}
                          </p>
                        </div>
                        <p className="hidden truncate text-sm text-muted-foreground sm:block">
                          {arrival.destinationName}
                        </p>
                        <span className="text-right text-sm font-semibold tabular-nums">
                          {formatArrivalTime(arrival.timeToStation)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
