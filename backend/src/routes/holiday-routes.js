import { Router } from "express"

const holidayRouter = Router()

holidayRouter.get("/", async (req, res) => {
  const countryCode =
    typeof req.query.countryCode === "string"
      ? req.query.countryCode.toUpperCase()
      : "US"

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return res.status(400).json({
      error: "Country code must be a two-letter code",
    })
  }

  const response = await fetch(
    `https://date.nager.at/api/v3/NextPublicHolidays/${countryCode}`
  )

  if (!response.ok) {
    return res.status(502).json({
      error: "Unable to fetch holidays",
    })
  }

  const data = await response.json()
  const nextHoliday = data[0]

  if (!nextHoliday) {
    return res.json({
      holiday: null,
    })
  }

  const holiday = {
    date: nextHoliday.date,
    localName: nextHoliday.localName,
    name: nextHoliday.name,
    countryCode: nextHoliday.countryCode,
    types: nextHoliday.types || [],
  }

  return res.json({
    holiday,
  })
})

export { holidayRouter }
