import { useState, useEffect } from "react"
import { getForecast, type Forecast } from "@/app/expenses/api/forecast-api"

export function useForecast() {
    const [forecast, setForecast] = useState<Forecast | null>(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadForecast() {
        try {
            setError("")
            const data = await getForecast()

            setForecast(data)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to load forecast")
        } finally {
            setIsLoading(false)
        }
        }

        void loadForecast()
    }, [])

    return {
        forecast,
        setForecast,
        error,
        setError,
        isLoading,
        setIsLoading,
    }
}