import prisma from "#prisma/client.js"
import { importExpensesSchema } from "#schemas/expense-schemas.js"

import { expenseRouter } from "../expense-router.js"

// Import expenses in CSV format
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
