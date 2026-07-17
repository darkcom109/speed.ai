import {
  ChevronRightIcon,
  LoaderCircleIcon,
  TrainFrontIcon,
} from "lucide-react"

import type { TflStation } from "@/app/transport/types/tfl-station"

type StationListProps = {
  stations: TflStation[]
  selectedStation: TflStation | null
  isSearching: boolean
  onSelectStation: (station: TflStation) => void
}

export default function StationList({
  stations,
  selectedStation,
  isSearching,
  onSelectStation,
}: StationListProps) {
  const visibleStations =
    stations.length > 0 ? stations : selectedStation ? [selectedStation] : []

  return (
    <section className="flex h-[min(38rem,calc(100vh-15rem))] min-h-96 flex-col border-b lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Search results</h3>
        {!isSearching && visibleStations.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {visibleStations.length}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {isSearching && (
          <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Searching stations...
          </p>
        )}

        {!isSearching && visibleStations.length === 0 && (
          <p className="p-2 text-sm text-muted-foreground">
            Search for a station to begin.
          </p>
        )}

        {visibleStations.map((station) => (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelectStation(station)}
            className={
              selectedStation?.id === station.id
                ? "group flex w-full items-center gap-3 rounded-md bg-muted px-3 py-3 text-left text-sm"
                : "group flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
              <TrainFrontIcon className="size-3.5" />
            </div>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{station.name}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground capitalize">
                {station.modes.join(", ")}
              </span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>
  )
}
