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
import { ArrowLeftIcon } from "lucide-react"

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
    handleResetSearch,
  } = useTransportStation()

  const showWorkspace =
    isSearching || stations.length > 0 || selectedStation !== null

  return (
    <Layout>
      <StationHeader />

      <div className="flex w-full items-center gap-2">
        {showWorkspace && (
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0"
            onClick={handleResetSearch}
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        )}
        <StationSearchForm
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
          onSearchStations={handleSearchStations}
          prominent={!showWorkspace}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showWorkspace ? (
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
      ) : (
        <NearbyStationsMap onSelectStation={handleSelectStation} />
      )}
    </Layout>
  )
}
