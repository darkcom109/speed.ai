import { useCallback, useState } from "react"

import { getNearbyTflStations } from "@/app/transport/api/tfl-api"
import type { NearbyTflStation } from "@/app/transport/types/tfl-station"

export type UserLocation = {
  latitude: number
  longitude: number
}

type LocationStatus = "idle" | "locating" | "loading" | "ready" | "error"

export default function useNearbyStations() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [stations, setStations] = useState<NearbyTflStation[]>([])
  const [status, setStatus] = useState<LocationStatus>("idle")
  const [error, setError] = useState("")

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.")
      setStatus("error")
      return
    }

    setError("")
    setStatus("locating")

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const currentLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        }

        setLocation(currentLocation)
        setStatus("loading")

        try {
          const nearbyStations = await getNearbyTflStations(
            currentLocation.latitude,
            currentLocation.longitude
          )
          setStations(nearbyStations)
          setStatus("ready")
        } catch {
          setError("We could not load nearby stations. Please try again.")
          setStatus("error")
        }
      },
      (locationError) => {
        setError(
          locationError.code === locationError.PERMISSION_DENIED
            ? "Allow location access to find stations near you."
            : "We could not determine your location. Please try again."
        )
        setStatus("error")
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      }
    )
  }, [])

  return {
    location,
    stations,
    status,
    error,
    locateUser,
  }
}
