import { TrainFrontIcon } from "lucide-react"

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
  return (
    <section className="flex h-[min(34rem,calc(100vh-17rem))] min-h-80 flex-col rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Stations</h3>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {isSearching && (
          <p className="p-2 text-sm text-muted-foreground">
            Searching stations...
          </p>
        )}

        {!isSearching && stations.length === 0 && (
          <p className="p-2 text-sm text-muted-foreground">
            Search for a station to begin.
          </p>
        )}

        {stations.map((station) => (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelectStation(station)}
            className={
              selectedStation?.id === station.id
                ? "flex w-full items-start gap-3 rounded-md bg-primary/10 px-3 py-3 text-left text-sm"
                : "flex w-full items-start gap-3 rounded-md px-3 py-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TrainFrontIcon className="size-4" />
            </div>
            <span className="min-w-0">
              <span className="block truncate font-medium">{station.name}</span>
              <span className="block truncate text-xs">
                {station.modes.join(", ")}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
