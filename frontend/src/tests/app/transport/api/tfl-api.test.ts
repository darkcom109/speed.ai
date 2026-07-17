import { describe, expect, it, vi } from "vitest"

import {
  getNearbyTflStations,
  getTflStationArrivals,
  searchTflStations,
} from "@/app/transport/api/tfl-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe("tfl-api", () => {
  it("returns stations from the wrapped backend response", async () => {
    const stations = [
      {
        id: "940GZZLUBNK",
        name: "Bank",
        modes: ["tube"],
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { stations },
    })

    await expect(searchTflStations("Bank")).resolves.toEqual(stations)
    expect(apiClient.get).toHaveBeenCalledWith("/tfl/stations/search", {
      params: { query: "Bank" },
    })
  })

  it("returns arrivals from the wrapped backend response", async () => {
    const arrivals = [
      {
        id: "arrival-1",
        lineName: "Central",
        platformName: "Westbound",
        destinationName: "Ealing Broadway",
        direction: "outbound",
        timeToStation: 120,
        expectedArrival: "2026-06-19T12:02:00.000Z",
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { arrivals },
    })

    await expect(getTflStationArrivals("station/id")).resolves.toEqual(arrivals)
    expect(apiClient.get).toHaveBeenCalledWith(
      "/tfl/stations/station%2Fid/arrivals"
    )
  })

  it("returns nearby stations for browser coordinates", async () => {
    const stations = [
      {
        id: "940GZZLUBNK",
        name: "Bank",
        modes: ["tube"],
        latitude: 51.5133,
        longitude: -0.0886,
        distanceMetres: 240,
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { stations } })

    await expect(getNearbyTflStations(51.51, -0.09)).resolves.toEqual(stations)
    expect(apiClient.get).toHaveBeenCalledWith("/tfl/stations/nearby", {
      params: { lat: 51.51, lon: -0.09 },
    })
  })
})
