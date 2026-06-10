import type { CSSProperties } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  StationArrivalsPanel,
  StationList,
  StationSearchForm,
  StationHeader,
} from "@/app/transport/components/station"
import useTransportStation from "@/app/transport/hooks/use-transport-station"

/**
 * Page shell for searching stations and checking arrival times
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Transport" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
