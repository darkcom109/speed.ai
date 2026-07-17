import {
  StationArrivalsPanel,
  StationList,
  StationSearchForm,
  StationHeader,
  NearbyStationsMap,
} from "@/app/transport/components/station"
import useTransportStation from "@/app/transport/hooks/use-transport-station"
import Layout from "@/components/app/Layout"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, MapPinIcon } from "lucide-react"
import { Link } from "react-router"

/**
 * Page shell for searching TfL stations and checking arrival times
 *
 * @returns The transport stations page layout.
 */
export default function TransportStationsPage() {
  const {
    query,
    stations,
    selectedStation,
    arrivals,
    error,
    isSearching,
    isLoadingArrivals,
    arrivalsByDirection,
    setQuery,
    handleSearchStations,
    handleSelectStation,
  } = useTransportStation()

  const showWorkspace =
    isSearching || stations.length > 0 || selectedStation !== null

  return (
    <Layout>
      <StationHeader />

      {!showWorkspace ? (
        <section className="flex min-h-[22rem] items-center justify-center border-y">
          <div className="w-full max-w-2xl text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md border bg-card text-muted-foreground">
              <MapPinIcon className="size-5" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Find a station</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Check live arrivals across Tube, DLR, Overground, and rail.
            </p>
            <div className="mt-6">
              <StationSearchForm
                query={query}
                setQuery={setQuery}
                isSearching={isSearching}
                onSearchStations={handleSearchStations}
                prominent
              />
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        </section>
      ) : (
        <>
          <div className="flex w-full items-center gap-2">
            <Button variant="outline" className="h-10 shrink-0" asChild>
              <Link to="/transport/status">
                <ArrowLeftIcon className="size-4" />
                Back
              </Link>
            </Button>
            <StationSearchForm
              query={query}
              setQuery={setQuery}
              isSearching={isSearching}
              onSearchStations={handleSearchStations}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid min-h-0 overflow-hidden rounded-lg border bg-card lg:grid-cols-[20rem_minmax(0,1fr)]">
            <StationList
              stations={stations}
              selectedStation={selectedStation}
              isSearching={isSearching}
              onSelectStation={handleSelectStation}
            />

            <StationArrivalsPanel
              selectedStation={selectedStation}
              arrivals={arrivals}
              arrivalsByDirection={arrivalsByDirection}
              isLoadingArrivals={isLoadingArrivals}
            />
          </div>
        </>
      )}

      {!showWorkspace && (
        <NearbyStationsMap onSelectStation={handleSelectStation} />
      )}
    </Layout>
  )
}
