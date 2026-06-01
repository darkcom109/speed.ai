import prisma from "#prisma/client.js"

import { expenseRouter } from "../expense-router.js"

// Delete an expense
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
