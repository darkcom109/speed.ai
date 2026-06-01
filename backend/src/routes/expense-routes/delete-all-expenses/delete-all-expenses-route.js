import prisma from "#prisma/client.js"

import { expenseRouter } from "../expense-router.js"

// Delete all expenses
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
