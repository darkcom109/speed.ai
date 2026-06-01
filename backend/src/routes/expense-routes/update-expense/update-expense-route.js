import prisma from "#prisma/client.js"
import { updateExpenseSchema } from "#schemas/expense-schemas.js"

import { expenseRouter } from "../expense-router.js"

// Update expense
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
