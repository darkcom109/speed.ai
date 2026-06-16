import { apiClient } from "@/lib/api-client"

export type Forecast = {
  totalIncome: number
  totalExpense: number
  monthlySavings: number
  currentSavings: number
  projections: {
    threeMonths: number
    sixMonths: number
    twelveMonths: number
  }
}

export async function getForecast(): Promise<Forecast> {
  const { data } = await apiClient.get<Forecast>("/prediction/forecast-regression")

  return data
}
