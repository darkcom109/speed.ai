import { useState } from "react"
import { ClockIcon, SearchIcon, TrainFrontIcon } from "lucide-react"
import type { FormEvent } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  getTflStationArrivals,
  searchTflStations,
} from "@/app/transport/api/tfl-api"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"

function formatArrivalTime(seconds: number) {
  const minutes = Math.max(0, Math.round(seconds / 60))

  if (minutes === 0) {
    return "Due"
  }

  return `${minutes} min`
}

export default function TransportStationsPage() {
  const [query, setQuery] = useState("")
  const [stations, setStations] = useState<TflStation[]>([])
  const [selectedStation, setSelectedStation] = useState<TflStation | null>(null)
  const [arrivals, setArrivals] = useState<TflArrival[]>([])
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false)

  async function handleSearchStations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    try {
      setError("")
      setIsSearching(true)
      setSelectedStation(null)
      setArrivals([])

      const stations = await searchTflStations(trimmedQuery)

      setStations(stations)
    } catch (error) {
      setStations([])
      setError(error instanceof Error ? error.message : "Unable to search stations")
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSelectStation(station: TflStation) {
    try {
      setError("")
      setSelectedStation(station)
      setIsLoadingArrivals(true)

      const arrivals = await getTflStationArrivals(station.id)

      setArrivals(arrivals)
    } catch (error) {
      setArrivals([])
      setError(error instanceof Error ? error.message : "Unable to load arrivals")
    } finally {
      setIsLoadingArrivals(false)
    }
  }

  const arrivalsByDirection = arrivals.reduce<Record<string, TflArrival[]>>(
    (groups, arrival) => {
      const direction = arrival.direction || arrival.platformName || "Unknown"
      groups[direction] = [...(groups[direction] || []), arrival]

      return groups
    },
    {}
  )

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
        <SiteHeader title="Transport" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Station arrivals
            </h2>
            <p className="text-sm text-muted-foreground">
              Search a station and view upcoming trains by direction.
            </p>
          </div>

          <form
            onSubmit={handleSearchStations}
            className="flex max-w-2xl items-center gap-2 rounded-lg border bg-card p-2"
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search station"
              className="h-10 border-0 bg-muted/60 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-10" disabled={isSearching}>
              <SearchIcon className="size-4" />
              Search
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid min-h-0 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
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
                    onClick={() => handleSelectStation(station)}
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
                      <span className="block truncate font-medium">
                        {station.name}
                      </span>
                      <span className="block truncate text-xs">
                        {station.modes.join(", ")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

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
                  <p className="text-sm text-muted-foreground">
                    Loading arrivals...
                  </p>
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
                    {Object.entries(arrivalsByDirection).map(([direction, arrivals]) => (
                      <div key={direction} className="overflow-hidden rounded-lg border bg-background">
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
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
