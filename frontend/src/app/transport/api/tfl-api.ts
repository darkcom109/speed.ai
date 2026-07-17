import type { TflStatusData } from "@/app/transport/types/tfl-status"
import type {
  NearbyTflStation,
  TflArrival,
  TflStation,
} from "@/app/transport/types/tfl-station"
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

// Returns nearby stations for the supplied browser coordinates.
export async function getNearbyTflStations(
  latitude: number,
  longitude: number
): Promise<NearbyTflStation[]> {
  const { data } = await apiClient.get<{ stations: NearbyTflStation[] }>(
    "/tfl/stations/nearby",
    {
      params: { lat: latitude, lon: longitude },
    }
  )

  return data.stations
}
