import type { Holiday } from "@/app/dashboard/types/holiday"

export async function getNextHoliday(countryCode = "US"): Promise<Holiday | null> {
  const response = await fetch(
    `http://localhost:3001/api/holidays?countryCode=${countryCode}`,
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load holidays")
  }

  return data.holiday
}
