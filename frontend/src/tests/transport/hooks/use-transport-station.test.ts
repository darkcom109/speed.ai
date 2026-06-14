import { act, renderHook } from "@testing-library/react"
import type { FormEvent } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getTflStationArrivals,
  searchTflStations,
} from "@/app/transport/api/tfl-api"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"

import useTransportStation from "@/app/transport/hooks/use-transport-station"

vi.mock("@/app/transport/api/tfl-api", () => ({
  getTflStationArrivals: vi.fn(),
  searchTflStations: vi.fn(),
}))

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

function createSubmitEvent(): FormEvent<HTMLFormElement> {
  return {
    preventDefault: vi.fn(),
  } as unknown as FormEvent<HTMLFormElement>
}

describe("useTransportStation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("searches stations with the current query", async () => {
    vi.mocked(searchTflStations).mockResolvedValue([station])

    const { result } = renderHook(() => useTransportStation())

    act(() => {
      result.current.setQuery("Bank")
    })

    await act(async () => {
      await result.current.handleSearchStations(createSubmitEvent())
    })

    expect(searchTflStations).toHaveBeenCalledWith("Bank")
    expect(result.current.stations).toEqual([station])
  })

  it("loads arrivals for the selected station", async () => {
    vi.mocked(getTflStationArrivals).mockResolvedValue([arrival])

    const { result } = renderHook(() => useTransportStation())

    await act(async () => {
      await result.current.handleSelectStation(station)
    })

    expect(getTflStationArrivals).toHaveBeenCalledWith(station.id)
    expect(result.current.selectedStation).toEqual(station)
    expect(result.current.arrivalsByDirection.inbound).toEqual([arrival])
  })
})
