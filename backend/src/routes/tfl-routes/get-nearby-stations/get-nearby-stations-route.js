import { tflRouter } from "../tfl-router.js"

const isValidCoordinate = (value, minimum, maximum) => {
  return Number.isFinite(value) && value >= minimum && value <= maximum
}

const STATION_CACHE_DURATION_MS = 15 * 60 * 1000
let stationCache = null
let stationCacheExpiresAt = 0

const toRadians = (degrees) => (degrees * Math.PI) / 180

const getDistanceMetres = (origin, destination) => {
  const earthRadiusMetres = 6_371_000
  const latitudeDelta = toRadians(destination.latitude - origin.latitude)
  const longitudeDelta = toRadians(destination.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const destinationLatitude = toRadians(destination.latitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadiusMetres * Math.asin(Math.sqrt(haversine))
}

const getStationCatalogue = async (appKey) => {
  if (stationCache && Date.now() < stationCacheExpiresAt) {
    return stationCache
  }

  const url = new URL(
    "https://api.tfl.gov.uk/StopPoint/Type/NaptanMetroStation"
  )
  url.searchParams.set("app_key", appKey)

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })

  if (!response.ok) {
    const error = new Error("Unable to load TfL station catalogue")
    error.status = response.status
    throw error
  }

  stationCache = await response.json()
  stationCacheExpiresAt = Date.now() + STATION_CACHE_DURATION_MS

  return stationCache
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
    const stationCatalogue = await getStationCatalogue(appKey)
    const seenStationIds = new Set()
    const stations = stationCatalogue
      .reduce((nearbyStations, station) => {
        if (
          !station.id ||
          !Number.isFinite(station.lat) ||
          !Number.isFinite(station.lon) ||
          seenStationIds.has(station.id)
        ) {
          return nearbyStations
        }

        const distanceMetres = Math.round(
          getDistanceMetres(
            { latitude, longitude },
            { latitude: station.lat, longitude: station.lon }
          )
        )

        if (distanceMetres > 5000) return nearbyStations

        seenStationIds.add(station.id)
        nearbyStations.push({
          id: station.id,
          name: station.commonName,
          modes: station.modes || [],
          latitude: station.lat,
          longitude: station.lon,
          distanceMetres,
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
