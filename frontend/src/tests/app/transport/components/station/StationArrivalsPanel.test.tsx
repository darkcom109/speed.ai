import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"

import StationArrivalsPanel from "@/app/transport/components/station/StationArrivalsPanel"

const station: TflStation = {
  id: "940GZZLUBNK",
  name: "Bank Underground Station",
  modes: ["tube"],
}

const arrival: TflArrival = {
  id: "arrival-1",
  lineName: "Central",
  platformName: "Platform 1",
  destinationName: "Ealing Broadway",
  direction: "inbound",
  timeToStation: 120,
  expectedArrival: "2026-06-10T12:00:00.000Z",
}

describe("StationArrivalsPanel", () => {
  it("asks the user to select a station", () => {
    render(
      <StationArrivalsPanel
        selectedStation={null}
        arrivals={[]}
        arrivalsByDirection={{}}
        isLoadingArrivals={false}
      />
    )

    expect(
      screen.getByText("Select a station to view incoming trains.")
    ).toBeInTheDocument()
  })

  it("renders station arrivals", () => {
    render(
      <StationArrivalsPanel
        selectedStation={station}
        arrivals={[arrival]}
        arrivalsByDirection={{ inbound: [arrival] }}
        isLoadingArrivals={false}
      />
    )

    expect(screen.getByText("Bank Underground Station")).toBeInTheDocument()
    expect(screen.getByText("Central")).toBeInTheDocument()
    expect(screen.getByText("Ealing Broadway")).toBeInTheDocument()
    expect(screen.getByText("2 min")).toBeInTheDocument()
  })
})
