import { tflRouter } from "../tfl-router.js"

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
