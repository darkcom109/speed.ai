import type { TflStatusData } from "@/app/transport/types/tfl-status"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"

// Returns TFL status of train lines
export async function getTflStatus(): Promise<TflStatusData> {
  const response = await fetch("http://localhost:3001/api/tfl/status")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load TfL status")
  }

  return data
}

// Returns TFL stations according to query
export async function searchTflStations(query: string): Promise<TflStation[]> {
  const response = await fetch(
    `http://localhost:3001/api/tfl/stations/search?query=${encodeURIComponent(query)}`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to search stations")
  }

  return data.stations
}

// Returns TFL station arrival times
export async function getTflStationArrivals(
  stationId: string
): Promise<TflArrival[]> {
  const response = await fetch(
    `http://localhost:3001/api/tfl/stations/${stationId}/arrivals`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load station arrivals")
  }

  return data.arrivals
}
