import { Router } from "express"

const weatherRouter = Router()

weatherRouter.get("/", async (req, res) => {
  const { latitude, longitude } = req.query

  const latitudeNumber = Number(latitude)
  const longitudeNumber = Number(longitude)

  if (!Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber)) {
    return res.status(400).json({
        error: "Latitude and longitude are required",
    })
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitudeNumber}&longitude=${longitudeNumber}&current=temperature_2m,weather_code,precipitation&daily=precipitation_probability_max&timezone=auto`
  )

  if (!response.ok) {
    return res.status(502).json({
        error: "Unable to fetch weather",
    })
  }

  const data = await response.json()

  const weather = {
    temperature: data.current.temperature_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    rainChance: data.daily.precipitation_probability_max[0],
    timezone: data.timezone,
  }

  res.json({ weather })
})

export { weatherRouter }