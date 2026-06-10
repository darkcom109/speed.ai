import type {
  TflArrival,
  TflStation,
} from "@/app/transport/types/tfl-station"

export type StationArrivalsPanelProps = {
  selectedStation: TflStation | null
  arrivals: TflArrival[]
  arrivalsByDirection: Record<string, TflArrival[]>
  isLoadingArrivals: boolean
}