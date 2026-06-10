import prisma from "#prisma/client.js"

import { savingRouter } from "../saving-router.js"

// Delete a saving account owned by the signed-in user
savingRouter.delete("/:savingAccountId", async (req, res) => {
  const existingSavingAccount = await prisma.savingAccount.findFirst({
    where: {
      id: req.params.savingAccountId,
      userId: req.userId,
    },
  })

  if (!existingSavingAccount) {
    return res.status(404).json({
      error: "Saving account not found",
    })
  }

  await prisma.savingAccount.delete({
    where: {
      id: existingSavingAccount.id,
    },
  })

  return res.status(200).json({
    message: "Saving account deleted",
  })
})
