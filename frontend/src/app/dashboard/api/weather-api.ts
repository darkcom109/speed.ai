import type { Weather } from "../types/weather"

export async function getWeather(latitude: number, longitude: number): Promise<Weather> {
    const response = await fetch(
        `http://localhost:3001/api/weather?latitude=${latitude}&longitude=${longitude}`,
        {
            credentials: "include",
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to load weather")
    }

    return data.weather
}