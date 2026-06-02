import prisma from "#prisma/client.js"

import { expenseRouter } from "../expense-router.js"

// Get All Expenses
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
