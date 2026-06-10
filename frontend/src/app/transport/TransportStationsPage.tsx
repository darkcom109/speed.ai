import {
  StationArrivalsPanel,
  StationList,
  StationSearchForm,
  StationHeader,
} from "@/app/transport/components/station"
import useTransportStation from "@/app/transport/hooks/use-transport-station"
import TransportLayout from "@/app/transport/components/TransportLayout"

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

  return (
    <TransportLayout>
      <StationHeader />
      
      <StationSearchForm
        query={query}
        setQuery={setQuery}
        isSearching={isSearching}
        onSearchStations={handleSearchStations}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid min-h-0 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
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
    </TransportLayout>
  )
}
