import { apiClient } from "@/lib/api-client"

export type Forecast = {
  totalIncome: number
  totalExpense: number
  monthlySavings: number
  currentSavings: number
  historyMonths: number
  confidence: "low" | "medium" | "high"
  method: string
  projections: {
    threeMonths: number
    sixMonths: number
    twelveMonths: number
  }
  ranges: {
    threeMonths: ForecastRange
    sixMonths: ForecastRange
    twelveMonths: ForecastRange
  }
  monthlyForecasts: number[]
}

type ForecastRange = {
  value: number
  low: number
  high: number
}

export async function getForecast(): Promise<Forecast> {
  const { data } = await apiClient.get<Forecast>("/prediction/forecast")

  return data
}
