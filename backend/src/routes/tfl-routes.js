import { Router } from "express"

const tflRouter = Router()

const tflModes = "tube,dlr,elizabeth-line,overground,tram"

tflRouter.get("/status", async (req, res) => {
  const appKey = process.env.TFL_APP_KEY

  if (!appKey) {
    return res.status(500).json({
      error: "TfL API key is not configured",
    })
  }

  try {
    const response = await fetch(
      `https://api.tfl.gov.uk/line/mode/${tflModes}/status?app_key=${appKey}`
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Unable to load TfL status",
      })
    }

    const lines = await response.json()

    return res.json({
      lines: lines.map((line) => {
        const currentStatus = line.lineStatuses?.[0]

        return {
          id: line.id,
          name: line.name,
          modeName: line.modeName,
          status: currentStatus?.statusSeverityDescription || "Unknown",
          statusSeverity: currentStatus?.statusSeverity || 0,
          reason: currentStatus?.reason || null,
        }
      }),
    })
  } catch (error) {
    console.error("TfL status error:", error)

    return res.status(500).json({
      error: "Unable to load TfL status",
    })
  }
})

tflRouter.get("/stations/search", async (req, res) => {
  const appKey = process.env.TFL_APP_KEY
  const query = String(req.query.query || "").trim()

  if (!appKey) {
    return res.status(500).json({
      error: "TfL API key is not configured",
    })
  }

  if (!query) {
    return res.status(400).json({
      error: "Station search query is required",
    })
  }

  try {
    const response = await fetch(
      `https://api.tfl.gov.uk/StopPoint/Search/${encodeURIComponent(query)}?modes=tube,dlr,elizabeth-line,overground&app_key=${appKey}`
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Unable to search stations",
      })
    }

    const data = await response.json()

    return res.json({
      stations: (data.matches || []).slice(0, 8).map((station) => ({
        id: station.id,
        name: station.name,
        modes: station.modes || [],
      })),
    })
  } catch (error) {
    console.error("TfL station search error:", error)

    return res.status(500).json({
      error: "Unable to search stations",
    })
  }
})

tflRouter.get("/stations/:stationId/arrivals", async (req, res) => {
  const appKey = process.env.TFL_APP_KEY
  const { stationId } = req.params

  if (!appKey) {
    return res.status(500).json({
      error: "TfL API key is not configured",
    })
  }

  try {
    const response = await fetch(
      `https://api.tfl.gov.uk/StopPoint/${encodeURIComponent(stationId)}/Arrivals?app_key=${appKey}`
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Unable to load station arrivals",
      })
    }

    const arrivals = await response.json()

    return res.json({
      arrivals: arrivals
        .sort((firstArrival, secondArrival) => {
          return firstArrival.timeToStation - secondArrival.timeToStation
        })
        .slice(0, 20)
        .map((arrival) => ({
          id: arrival.id,
          lineName: arrival.lineName,
          platformName: arrival.platformName,
          destinationName: arrival.destinationName,
          direction: arrival.direction,
          timeToStation: arrival.timeToStation,
          expectedArrival: arrival.expectedArrival,
        })),
    })
  } catch (error) {
    console.error("TfL station arrivals error:", error)

    return res.status(500).json({
      error: "Unable to load station arrivals",
    })
  }
})

export { tflRouter }
