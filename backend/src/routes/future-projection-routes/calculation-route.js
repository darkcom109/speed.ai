import { futurePredictionRouter } from "./future-prediction-router.js";
import prisma from "#prisma/client.js";

futurePredictionRouter.get("/forecast", async (req, res) => {
    try {
        const now = new Date()

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        )
        startOfMonth.setHours(0, 0, 0, 0)

        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        )
        endOfMonth.setHours(23, 59, 59, 999)

        const incomes = await prisma.expense.findMany({
            where: {
                userId: req.userId,
                kind: "income",
                spentAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                }
            },
            select: {
                amount: true,
            }
        })

        const expenses = await prisma.expense.findMany({
            where: {
                userId: req.userId,
                kind: "expense",
                spentAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            select: {
                amount: true
            }
        })

        const totalIncome = incomes.reduce((acc, income) => {
            return acc + income.amount
        }, 0)

        const totalExpense = expenses.reduce((acc, expense) => {
            return acc + expense.amount
        }, 0)

        const monthlySavings = totalIncome - totalExpense

        const savings = await prisma.savingAccount.findMany({
            where: {
                userId: req.userId
            },
            select: {
                currentAmount: true
            }
        })

        const currentSavings = savings.reduce((acc, saving) => {
            return acc + saving.currentAmount
        }, 0)

        const threeMonthsProjection = currentSavings + (monthlySavings * 3)
        const sixMonthsProjection = currentSavings + (monthlySavings * 6)
        const twelveMonthsProjection = currentSavings + (monthlySavings * 12)

        return res.status(200).json({
            totalIncome,
            totalExpense,
            monthlySavings,
            currentSavings,
            projections: {
                threeMonths: threeMonthsProjection,
                sixMonths: sixMonthsProjection,
                twelveMonths: twelveMonthsProjection
            }
        })
    }
    catch {
        return res.status(400).json({
            error: "Unable to calculate forecasted finances"
        })
    }
})