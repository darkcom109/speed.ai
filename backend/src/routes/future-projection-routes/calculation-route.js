import { futurePredictionRouter } from "./future-prediction-router";
import prisma from "#prisma/client.js";

futurePredictionRouter.get("/forecast", async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const endOfMonth = new Date(today.getDate() + 30)
        endOfMonth.setHours(23, 59, 59, 999)

        const incomes = prisma.expense.findMany({
            where: {
                userId: req.userId,
                kind: "income"
            },
            select: {
                spentAt: {
                    gte: today,
                    lte: endOfMonth
                }
            }
        })

        const expenses = prisma.expense.findMany({
            where: {
                userId: req.userId,
                kind: "expense"
            },
            select: {
                spentAt: {
                    gte: today,
                    lte: endOfMonth
                }
            }
        })
    }
    catch {
        return res.status(400).json({
            error: "Unable to calculate forecasted finances"
        })
    }
})