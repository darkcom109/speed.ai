import { tflRouter } from "../tfl-router.js"

const isValidCoordinate = (value, minimum, maximum) => {
  return Number.isFinite(value) && value >= minimum && value <= maximum
}

const STATION_TYPES = ["NaptanMetroStation", "NaptanRailStation"]
const SUPPORTED_MODES = new Set([
  "tube",
  "dlr",
  "overground",
  "elizabeth-line",
  "national-rail",
])
const RETRY_DELAYS_MS = [0, 500, 1500]

const wait = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration))

const fetchNearbyStations = async (url) => {
  let lastError

  for (const [attempt, delay] of RETRY_DELAYS_MS.entries()) {
    if (delay > 0) await wait(delay)

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
      })
      const canRetry = response.status === 429 || response.status >= 500

      if (!canRetry || attempt === RETRY_DELAYS_MS.length - 1) {
        return response
      }
    } catch (error) {
      lastError = error

      if (attempt === RETRY_DELAYS_MS.length - 1) {
        throw error
      }
    }
  }

  throw lastError
}

// Find public transport stations around a geographic coordinate.
tflRouter.get("/stations/nearby", async (req, res) => {
  const appKey = process.env.TFL_APP_KEY
  const latitude = Number(req.query.lat)
  const longitude = Number(req.query.lon)

  if (!appKey) {
    return res.status(500).json({ error: "TfL API key is not configured" })
  }

  if (
    !isValidCoordinate(latitude, -90, 90) ||
    !isValidCoordinate(longitude, -180, 180)
  ) {
    return res.status(400).json({ error: "Valid latitude and longitude are required" })
  }

  try {
    const url = new URL("https://api.tfl.gov.uk/StopPoint")
    url.searchParams.set("lat", latitude)
    url.searchParams.set("lon", longitude)
    url.searchParams.set("radius", "5000")
    url.searchParams.set("stopTypes", STATION_TYPES.join(","))
    url.searchParams.set("app_key", appKey)

    const response = await fetchNearbyStations(url)

    if (!response.ok) {
      const error = new Error("Unable to load nearby TfL stations")
      error.status = response.status
      throw error
    }

    const data = await response.json()
    const seenStationIds = new Set()
    const stations = (data.stopPoints || [])
      .reduce((nearbyStations, station) => {
        if (
          !station.id ||
          !Number.isFinite(station.lat) ||
          !Number.isFinite(station.lon) ||
          !Number.isFinite(station.distance) ||
          seenStationIds.has(station.id) ||
          !(station.modes || []).some((mode) => SUPPORTED_MODES.has(mode))
        ) {
          return nearbyStations
        }

        seenStationIds.add(station.id)
        nearbyStations.push({
          id: station.id,
          name: station.commonName,
          modes: station.modes || [],
          latitude: station.lat,
          longitude: station.lon,
          distanceMetres: Math.round(station.distance),
        })

        return nearbyStations
      }, [])
      .sort((firstStation, secondStation) => {
        return firstStation.distanceMetres - secondStation.distanceMetres
      })
      .slice(0, 8)

    return res.json({ stations })
  } catch (error) {
    console.error("TfL nearby stations error:", error)

    return res
      .status(error.status || 500)
      .json({ error: "Unable to load nearby stations" })
  }
})
