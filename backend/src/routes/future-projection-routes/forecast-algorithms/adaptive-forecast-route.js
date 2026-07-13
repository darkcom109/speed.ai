import prisma from "#prisma/client.js"
import { futurePredictionRouter } from "../future-prediction-router.js"
import { buildAdaptiveForecast } from "./adaptive-forecast.js"

futurePredictionRouter.get("/forecast", async (req, res) => {
  try {
    const now = new Date()
    const historyStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1)
    )
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    )

    const [entries, savings] = await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: req.userId,
          spentAt: {
            gte: historyStart,
            lt: currentMonthStart,
          },
        },
        select: {
          amount: true,
          kind: true,
          spentAt: true,
        },
        orderBy: {
          spentAt: "asc",
        },
      }),
      prisma.savingAccount.findMany({
        where: {
          userId: req.userId,
        },
        select: {
          currentAmount: true,
        },
      }),
    ])
    const currentSavings = savings.reduce(
      (total, saving) => total + saving.currentAmount,
      0
    )
    const forecast = buildAdaptiveForecast(entries, currentSavings, now)

    return res.status(200).json(forecast)
  } catch (error) {
    if (error instanceof Error && error.code === "INSUFFICIENT_HISTORY") {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({
      error: "Unable to calculate the finance forecast",
    })
  }
})
