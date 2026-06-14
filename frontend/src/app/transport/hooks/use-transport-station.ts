import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import {
  getTflStationArrivals,
  searchTflStations,
} from "@/app/transport/api/tfl-api"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"
import { groupArrivalsByDirection } from "@/app/transport/utils/transport-station-utils"
import { useNavigate } from "react-router"

/**
 * Manages TfL station search and arrival loading state.
 *
 * @returns Station search state, selected station arrivals, grouped arrivals,
 * and handlers for searching/selecting stations.
 */
export default function useTransportStation() {
  const [query, setQuery] = useState("")
  const [stations, setStations] = useState<TflStation[]>([])
  const [selectedStation, setSelectedStation] = useState<TflStation | null>(null)
  const [arrivals, setArrivals] = useState<TflArrival[]>([])
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        navigate("/login")
      }
    }

    void checkAuth()
  }, [navigate])
  
  async function handleSearchStations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    try {
      setError("")
      setIsSearching(true)
      setSelectedStation(null)
      setArrivals([])

      const stations = await searchTflStations(trimmedQuery)

      setStations(stations)
    } catch (error) {
      setStations([])
      setError(error instanceof Error ? error.message : "Unable to search stations")
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSelectStation(station: TflStation) {
    try {
      setError("")
      setSelectedStation(station)
      setIsLoadingArrivals(true)

      const arrivals = await getTflStationArrivals(station.id)

      setArrivals(arrivals)
    } catch (error) {
      setArrivals([])
      setError(error instanceof Error ? error.message : "Unable to load arrivals")
    } finally {
      setIsLoadingArrivals(false)
    }
  }

  const arrivalsByDirection = groupArrivalsByDirection(arrivals)

  return {
    query,
    stations,
    selectedStation,
    arrivals,
    error,
    isSearching,
    isLoadingArrivals,
    arrivalsByDirection,
    setQuery,
    handleSearchStations,
    handleSelectStation,
  }
}
