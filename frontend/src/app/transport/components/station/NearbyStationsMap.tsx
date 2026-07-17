import { useEffect } from "react"
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import { LocateFixedIcon, LoaderCircleIcon, NavigationIcon } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import useNearbyStations, {
  type UserLocation,
} from "@/app/transport/hooks/use-nearby-stations"
import type {
  NearbyTflStation,
  TflStation,
} from "@/app/transport/types/tfl-station"
import { Button } from "@/components/ui/button"

const LONDON_CENTRE: [number, number] = [51.5074, -0.1278]

type NearbyStationsMapProps = {
  onSelectStation: (station: TflStation) => void
}

type MapViewportProps = {
  location: UserLocation | null
  stations: NearbyTflStation[]
}

function MapViewport({ location, stations }: MapViewportProps) {
  const map = useMap()

  useEffect(() => {
    if (!location) return

    const points = [
      L.latLng(location.latitude, location.longitude),
      ...stations.map((station) =>
        L.latLng(station.latitude, station.longitude)
      ),
    ]

    map.fitBounds(L.latLngBounds(points), {
      animate: true,
      duration: 0.6,
      maxZoom: 15,
      padding: [38, 38],
    })
  }, [location, map, stations])

  return null
}

const formatDistance = (distanceMetres: number) => {
  if (distanceMetres < 1000) return `${distanceMetres} m`
  return `${(distanceMetres / 1000).toFixed(1)} km`
}

export default function NearbyStationsMap({
  onSelectStation,
}: NearbyStationsMapProps) {
  const { location, stations, status, error, locateUser } = useNearbyStations()
  const isLoading = status === "locating" || status === "loading"

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        {stations.length > 0 ? (
          <div className="flex h-[25rem] flex-col border-b lg:border-r lg:border-b-0">
            <div className="border-b px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <NavigationIcon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Nearby stations</p>
                  <p className="text-xs text-muted-foreground">
                    {stations.length} found within 5 km
                  </p>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
              {stations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => onSelectStation(station)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <NavigationIcon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {station.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(station.distanceMetres)} away
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t p-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={locateUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <LocateFixedIcon className="size-4" />
                )}
                {isLoading ? "Updating location" : "Refresh location"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center border-b px-6 py-8 text-center lg:h-[25rem] lg:border-r lg:border-b-0">
            {isLoading ? (
              <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <LocateFixedIcon className="size-7 text-muted-foreground" />
            )}
            <h3 className="mt-4 text-base font-semibold">
              {status === "ready"
                ? "No nearby stations"
                : isLoading
                  ? "Finding nearby stations"
                  : "Find stations near you"}
            </h3>
            <p className="mt-1 max-w-52 text-sm text-muted-foreground">
              {status === "ready"
                ? "No supported TfL stations were found within 5 km."
                : "Use your location to see the closest TfL stops."}
            </p>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <Button
              type="button"
              className="mt-5 w-full max-w-52"
              onClick={locateUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <LocateFixedIcon className="size-4" />
              )}
              {isLoading
                ? "Finding stations"
                : status === "ready"
                  ? "Try again"
                  : "Use my location"}
            </Button>
          </div>
        )}

        <div className="relative h-[25rem] overflow-hidden bg-muted/20">
          <MapContainer
            center={LONDON_CENTRE}
            zoom={11}
            scrollWheelZoom
            className="size-full bg-background"
            aria-label="Map of nearby stations"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapViewport location={location} stations={stations} />

            {location && (
              <CircleMarker
                center={[location.latitude, location.longitude]}
                radius={8}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>Your location</Popup>
              </CircleMarker>
            )}

            {stations.map((station) => (
              <CircleMarker
                key={station.id}
                center={[station.latitude, station.longitude]}
                radius={7}
                eventHandlers={{
                  click: () => onSelectStation(station),
                }}
                pathOptions={{
                  color: "#111111",
                  fillColor: "#f5f5f5",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>{station.name}</strong>
                  <br />
                  {formatDistance(station.distanceMetres)} away
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {!location && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-[500] rounded-md border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              Location markers appear after permission is granted.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
