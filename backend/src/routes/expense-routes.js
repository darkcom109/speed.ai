import { Router } from "express"

import prisma from "#prisma/client.js"
import { requireAuth } from "#middleware/require-auth.js"
import {
  createExpenseSchema,
  importExpensesSchema,
  updateExpenseSchema,
} from "#schemas/expense-schemas.js"

const expenseRouter = Router()

expenseRouter.use(requireAuth)

expenseRouter.get("/", async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      spentAt: "desc",
    },
  })

  return res.status(200).json({
    expenses,
  })
})

expenseRouter.post("/", async (req, res) => {
  const result = createExpenseSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { title, amount, kind, category, spentAt } = result.data
  const expenseKind = kind || "expense"

  const expense = await prisma.expense.create({
    data: {
      title,
      amount: Math.abs(amount),
      kind: expenseKind,
      category: category || (expenseKind === "income" ? "Income" : "General"),
      spentAt: spentAt ? new Date(spentAt) : undefined,
      userId: req.userId,
    },
  })

  return res.status(201).json({
    expense,
  })
})

expenseRouter.post("/import", async (req, res) => {
  const result = importExpensesSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const expenses = result.data.expenses.map((expense) => {
    const expenseKind = expense.kind || "expense"

    return {
      title: expense.title,
      amount: Math.abs(expense.amount),
      kind: expenseKind,
      category: expense.category || (expenseKind === "income" ? "Income" : "General"),
      spentAt: expense.spentAt ? new Date(expense.spentAt) : new Date(),
      userId: req.userId,
    }
  })

  const importedExpenses = await prisma.expense.createMany({
    data: expenses,
  })

  return res.status(201).json({
    count: importedExpenses.count,
  })
})

expenseRouter.patch("/:id", async (req, res) => {
  const result = updateExpenseSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId,
    },
  })

  if (!expense) {
    return res.status(404).json({
      error: "Expense not found",
    })
  }

  const updatedExpense = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: {
      ...result.data,
      spentAt: result.data.spentAt ? new Date(result.data.spentAt) : undefined,
    },
  })

  return res.status(200).json({
    expense: updatedExpense,
  })
})

expenseRouter.delete("/delete_all", async (req, res) => {
  try {
    const result = await prisma.expense.deleteMany({
      where: {
        userId: req.userId,
      },
    })

    return res.status(200).json({
      message: "All finances deleted",
      count: result.count,
    })
  } catch {
    return res.status(500).json({
      error: "Failed to delete all finances",
    })
  }
})

expenseRouter.delete("/:id", async (req, res) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId,
    },
  })

  if (!expense) {
    return res.status(404).json({
      error: "Expense not found",
    })
  }

  await prisma.expense.delete({
    where: {
      id: expense.id,
    },
  })

  return res.status(200).json({
    message: "Expense deleted",
  })
})

export { expenseRouter }
