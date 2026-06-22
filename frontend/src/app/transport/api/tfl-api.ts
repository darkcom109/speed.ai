import type { TflStatusData } from "@/app/transport/types/tfl-status"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"
import { apiClient } from "@/lib/api-client"

// Returns TFL status of train lines
export async function getTflStatus(): Promise<TflStatusData> {
  const { data } = await apiClient.get<TflStatusData>("/tfl/status")

  return data
}

// Returns TFL stations according to query
export async function searchTflStations(query: string): Promise<TflStation[]> {
  const { data } = await apiClient.get<{ stations: TflStation[] }>(
    "/tfl/stations/search",
    {
      params: { query },
    }
  )

  return data.stations
}

// Returns TFL station arrival times
export async function getTflStationArrivals(
  stationId: string
): Promise<TflArrival[]> {
  const { data } = await apiClient.get<{ arrivals: TflArrival[] }>(
    `/tfl/stations/${encodeURIComponent(stationId)}/arrivals`
  )

  return data.arrivals
}
