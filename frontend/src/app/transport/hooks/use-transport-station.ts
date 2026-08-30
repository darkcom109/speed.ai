import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  getTflStationArrivals,
  searchTflStations,
} from "@/app/transport/api/tfl-api"
import type { TflArrival, TflStation } from "@/app/transport/types/tfl-station"
import { groupArrivalsByDirection } from "@/app/transport/utils/transport-station-utils"
import { apiClient } from "@/lib/api-client"
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
  const [selectedStation, setSelectedStation] = useState<TflStation | null>(
    null
  )
  const [arrivals, setArrivals] = useState<TflArrival[]>([])
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false)
  const searchRequestId = useRef(0)
  const arrivalsRequestId = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      try {
        await apiClient.get("/auth/me")
      } catch {
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

    const requestId = ++searchRequestId.current
    arrivalsRequestId.current += 1

    try {
      setError("")
      setIsSearching(true)
      setSelectedStation(null)
      setArrivals([])

      const stations = await searchTflStations(trimmedQuery)

      if (requestId !== searchRequestId.current) return

      setStations(stations)
      if (stations.length === 0) {
        setError(`No stations found for "${trimmedQuery}"`)
      }
    } catch (error) {
      if (requestId !== searchRequestId.current) return

      setStations([])
      setError(
        error instanceof Error ? error.message : "Unable to search stations"
      )
    } finally {
      if (requestId === searchRequestId.current) {
        setIsSearching(false)
      }
    }
  }

  async function handleSelectStation(station: TflStation) {
    const requestId = ++arrivalsRequestId.current

    try {
      setError("")
      setSelectedStation(station)
      setIsLoadingArrivals(true)

      const arrivals = await getTflStationArrivals(station.id)

      if (requestId !== arrivalsRequestId.current) return

      setArrivals(arrivals)
    } catch (error) {
      if (requestId !== arrivalsRequestId.current) return

      setArrivals([])
      setError(
        error instanceof Error ? error.message : "Unable to load arrivals"
      )
    } finally {
      if (requestId === arrivalsRequestId.current) {
        setIsLoadingArrivals(false)
      }
    }
  }

  function handleResetSearch() {
    searchRequestId.current += 1
    arrivalsRequestId.current += 1
    setQuery("")
    setStations([])
    setSelectedStation(null)
    setArrivals([])
    setError("")
    setIsSearching(false)
    setIsLoadingArrivals(false)
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
    handleResetSearch,
  }
}
