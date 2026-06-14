import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { TflStation } from "@/app/transport/types/tfl-station"

import StationList from "@/app/transport/components/station/StationList"

const station: TflStation = {
  id: "940GZZLUBNK",
  name: "Bank Underground Station",
  modes: ["tube"],
}

describe("StationList", () => {
  it("shows the initial empty state", () => {
    render(
      <StationList
        stations={[]}
        selectedStation={null}
        isSearching={false}
        onSelectStation={vi.fn()}
      />
    )

    expect(screen.getByText("Search for a station to begin.")).toBeInTheDocument()
  })

  it("calls onSelectStation when a station is clicked", () => {
    const onSelectStation = vi.fn()

    render(
      <StationList
        stations={[station]}
        selectedStation={null}
        isSearching={false}
        onSelectStation={onSelectStation}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /bank underground/i }))

    expect(onSelectStation).toHaveBeenCalledWith(station)
  })
})
