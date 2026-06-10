import { futurePredictionRouter } from "../future-prediction-router.js";
import prisma from "#prisma/client.js";

futurePredictionRouter.get("/forecast-regression", async (req, res) => {
    try {
        const now = new Date()

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            1
        )
        startOfMonth.setHours(0, 0, 0, 0)

        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
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
                spentAt: true,
            }
        })

        const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0)

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
                amount: true,
                spentAt: true,
            }
        })

        const totalExpense = expenses.reduce((acc, expense) => acc + expense.amount, 0)

        const monthlySavings = (totalIncome - totalExpense) / 3

        function getMonthKey(date) {
            const parsedDate = new Date(date)
            return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`
        }

        const months = [
            new Date(now.getFullYear(), now.getMonth() - 3, 1),
            new Date(now.getFullYear(), now.getMonth() - 2, 1),
            new Date(now.getFullYear(), now.getMonth() - 1, 1),
        ]

        const monthKeys = months.map(getMonthKey)

        const monthlyData = monthKeys.map((key) => {
            const totalIncome = incomes.filter((income) => getMonthKey(income.spentAt) === key).reduce((acc, income) => acc + income.amount, 0)
            const totalExpense = expenses.filter((expense) => getMonthKey(expense.spentAt) === key).reduce((acc, expense) => acc + expense.amount, 0)
            const net = totalIncome - totalExpense

            return {
                month: key,
                income: totalIncome,
                expense: totalExpense,
                net,
            }
        })

        const points = monthlyData.map((month, index) => {
            return {
                x: index,
                y: month.net
            }
        })

        const averageX = points.reduce((acc, point) => acc + point.x, 0) / points.length
        const averageY = points.reduce((acc, point) => acc + point.y, 0) / points.length

        const differenceX = points.map((point) => point.x - averageX)
        const differenceY = points.map((point) => point.y - averageY)

        let numerator = 0

        for (let i = 0 ; i < differenceX.length ; i++) {
            const xValue = differenceX[i]
            const yValue = differenceY[i]

            numerator += xValue * yValue
        }

        const denominator = differenceX.map((value) => value ** 2).reduce((acc, value) => acc + value, 0)

        const gradient = numerator / denominator
        const intercept = averageY - (gradient * averageX)

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

        function predict(x) {
            return intercept + (gradient * x)
        }

        const arr = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

        const threeMonthsProjection = currentSavings + arr.slice(0, 3).map((month) => {
            return predict(month)
        }).reduce((acc, value) => acc + value, 0)

        const sixMonthsProjection = currentSavings + arr.slice(0, 6).map((month) => {
            return predict(month)
        }).reduce((acc, value) => acc + value, 0)

        const twelveMonthsProjection = currentSavings + arr.map((month) => {
            return predict(month)
        }).reduce((acc, value) => acc + value, 0)

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