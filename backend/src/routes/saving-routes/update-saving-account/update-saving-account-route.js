import prisma from "#prisma/client.js"
import { updateSavingAccountSchema } from "#schemas/saving-schemas.js"

import { savingRouter } from "../saving-router.js"

// Update a saving account owned by the signed-in user
savingRouter.patch("/:savingAccountId", async (req, res) => {
  const result = updateSavingAccountSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

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

  const savingAccount = await prisma.savingAccount.update({
    where: {
      id: existingSavingAccount.id,
    },
    data: {
      ...result.data,
    },
  })

  return res.status(200).json({
    savingAccount,
  })
})
