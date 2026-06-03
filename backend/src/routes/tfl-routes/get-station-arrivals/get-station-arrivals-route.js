import { tflRouter } from "../tfl-router.js"

// Get live arrivals for a TfL station
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
