import { tflRouter } from "../tfl-router.js"

// Search TfL stations by name
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
