import type { TflArrival } from "@/app/transport/types/tfl-station"

export function formatArrivalTime(seconds: number) {
  const minutes = Math.max(0, Math.round(seconds / 60)) // Never show negative values

  if (minutes === 0) {
    return "Due"
  }

  return `${minutes} min`
}

export function groupArrivalsByDirection(arrivals: TflArrival[]) {
  return arrivals.reduce<Record<string, TflArrival[]>>((groups, arrival) => {
    const direction = arrival.direction || arrival.platformName || "Unknown"
    groups[direction] = [...(groups[direction] || []), arrival]

    return groups
  }, {})
}
