function median(values) {
  if (!values.length) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function getMonthKey(date) {
  const parsedDate = new Date(date)
  return `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, "0")}`
}

function robustSeries(values) {
  const centre = median(values)
  const deviation = median(values.map((value) => Math.abs(value - centre)))

  if (deviation === 0) return values

  const robustSigma = deviation * 1.4826
  const lowerBound = centre - robustSigma * 3
  const upperBound = centre + robustSigma * 3

  return values.map((value) => Math.min(Math.max(value, lowerBound), upperBound))
}

function fitDampedTrend(values) {
  const alpha = values.length >= 8 ? 0.4 : 0.55
  const beta = values.length >= 8 ? 0.18 : 0.25
  const damping = 0.82
  const differences = values.slice(1).map((value, index) => value - values[index])

  let level = values[0]
  let trend = median(differences)
  const residuals = []

  for (let index = 1; index < values.length; index += 1) {
    const predicted = level + damping * trend
    residuals.push(values[index] - predicted)

    const previousLevel = level
    level = alpha * values[index] + (1 - alpha) * predicted
    trend =
      beta * (level - previousLevel) +
      (1 - beta) * damping * trend
  }

  const residualScale = Math.max(
    median(residuals.map((residual) => Math.abs(residual))) * 1.4826,
    1
  )

  return { level, trend, damping, residualScale }
}

function forecastMonthlyNet(model, horizon) {
  const dampingSum =
    model.damping * (1 - model.damping ** horizon) / (1 - model.damping)

  return model.level + model.trend * dampingSum
}

function confidenceLabel(historyMonths, values, residualScale) {
  const typicalMovement = Math.max(
    median(values.map((value) => Math.abs(value))),
    1
  )
  const noiseRatio = residualScale / typicalMovement

  if (historyMonths >= 9 && noiseRatio <= 0.35) return "high"
  if (historyMonths >= 6 && noiseRatio <= 0.75) return "medium"
  return "low"
}

export function buildAdaptiveForecast(entries, currentSavings, now = new Date()) {
  const months = Array.from({ length: 12 }, (_, index) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12 + index, 1))
  )
  const monthlyData = months.map((month) => {
    const key = getMonthKey(month)
    const monthEntries = entries.filter((entry) => getMonthKey(entry.spentAt) === key)
    const income = monthEntries
      .filter((entry) => entry.kind === "income")
      .reduce((total, entry) => total + entry.amount, 0)
    const expense = monthEntries
      .filter((entry) => entry.kind === "expense")
      .reduce((total, entry) => total + entry.amount, 0)

    return { month: key, income, expense, net: income - expense }
  })
  const activeMonthCount = monthlyData.filter(
    (month) => month.income > 0 || month.expense > 0
  ).length

  if (activeMonthCount < 3) {
    const error = new Error("At least 3 completed months of finance data are required")
    error.code = "INSUFFICIENT_HISTORY"
    throw error
  }

  const firstActiveIndex = monthlyData.findIndex(
    (month) => month.income > 0 || month.expense > 0
  )
  const history = monthlyData.slice(firstActiveIndex)
  const values = robustSeries(history.map((month) => month.net))
  const model = fitDampedTrend(values)
  const monthlyForecasts = Array.from({ length: 12 }, (_, index) =>
    forecastMonthlyNet(model, index + 1)
  )

  function projection(horizon) {
    const expectedChange = monthlyForecasts
      .slice(0, horizon)
      .reduce((total, value) => total + value, 0)
    const interval = 1.28 * model.residualScale * Math.sqrt(horizon)

    return {
      value: currentSavings + expectedChange,
      low: currentSavings + expectedChange - interval,
      high: currentSavings + expectedChange + interval,
    }
  }

  const totalIncome = history.reduce((total, month) => total + month.income, 0)
  const totalExpense = history.reduce((total, month) => total + month.expense, 0)

  return {
    totalIncome,
    totalExpense,
    monthlySavings:
      monthlyForecasts.slice(0, 3).reduce((total, value) => total + value, 0) / 3,
    currentSavings,
    historyMonths: history.length,
    confidence: confidenceLabel(history.length, values, model.residualScale),
    method: "Robust damped trend",
    projections: {
      threeMonths: projection(3).value,
      sixMonths: projection(6).value,
      twelveMonths: projection(12).value,
    },
    ranges: {
      threeMonths: projection(3),
      sixMonths: projection(6),
      twelveMonths: projection(12),
    },
    monthlyForecasts,
  }
}
