import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import useTransportStation from "@/app/transport/hooks/use-transport-station"

import TransportStationsPage from "./TransportStationsPage"

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}))

vi.mock("@/components/site-header", () => ({
  SiteHeader: ({ title }: { title: string }) => <header>{title}</header>,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarInset: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("@/app/transport/components/station", () => ({
  StationArrivalsPanel: ({
    arrivals,
  }: {
    arrivals: unknown[]
  }) => <section>Arrivals: {arrivals.length}</section>,
  StationHeader: () => <section>Station header</section>,
  StationList: ({
    stations,
  }: {
    stations: unknown[]
  }) => <section>Stations: {stations.length}</section>,
  StationSearchForm: ({ query }: { query: string }) => (
    <section>Search query: {query}</section>
  ),
}))

vi.mock("@/app/transport/hooks/use-transport-station", () => ({
  default: vi.fn(),
}))

const mockedUseTransportStation = vi.mocked(useTransportStation)

describe("TransportStationsPage", () => {
  it("renders station search sections", () => {
    mockedUseTransportStation.mockReturnValue({
      query: "Bank",
      stations: [{ id: "bank", name: "Bank", modes: ["tube"] }],
      selectedStation: null,
      arrivals: [],
      error: "",
      isSearching: false,
      isLoadingArrivals: false,
      arrivalsByDirection: {},
      setQuery: vi.fn(),
      handleSearchStations: vi.fn(),
      handleSelectStation: vi.fn(),
    })

    render(<TransportStationsPage />)

    expect(screen.getByText("Transport")).toBeInTheDocument()
    expect(screen.getByText("Station header")).toBeInTheDocument()
    expect(screen.getByText("Search query: Bank")).toBeInTheDocument()
    expect(screen.getByText("Stations: 1")).toBeInTheDocument()
    expect(screen.getByText("Arrivals: 0")).toBeInTheDocument()
  })

  it("renders station page errors", () => {
    mockedUseTransportStation.mockReturnValue({
      query: "",
      stations: [],
      selectedStation: null,
      arrivals: [],
      error: "Unable to search stations",
      isSearching: false,
      isLoadingArrivals: false,
      arrivalsByDirection: {},
      setQuery: vi.fn(),
      handleSearchStations: vi.fn(),
      handleSelectStation: vi.fn(),
    })

    render(<TransportStationsPage />)

    expect(screen.getByText("Unable to search stations")).toBeInTheDocument()
  })
})
