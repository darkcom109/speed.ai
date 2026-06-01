import prisma from "#prisma/client.js"
import { createExpenseSchema } from "#schemas/expense-schemas.js"

import { expenseRouter } from "../expense-router.js"

// Create expense
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
