import prisma from "#prisma/client.js"

import { savingRouter } from "../saving-router.js"

// Get all saving accounts for the signed-in user
savingRouter.get("/", async (req, res) => {
  const savingAccounts = await prisma.savingAccount.findMany({
    where: {
      userId: req.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return res.status(200).json({
    savingAccounts,
  })
})
