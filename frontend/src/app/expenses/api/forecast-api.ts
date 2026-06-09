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
  const response = await fetch("http://localhost:3001/api/prediction/forecast", {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load forecast")
  }

  return data
}
