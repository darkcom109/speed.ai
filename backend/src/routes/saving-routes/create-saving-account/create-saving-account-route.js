import prisma from "#prisma/client.js"
import { createSavingAccountSchema } from "#schemas/saving-schemas.js"

import { savingRouter } from "../saving-router.js"

// Create a saving account for the signed-in user
savingRouter.post("/", async (req, res) => {
  const result = createSavingAccountSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const savingAccount = await prisma.savingAccount.create({
    data: {
      name: result.data.name,
      currentAmount: result.data.currentAmount || 0,
      targetAmount: result.data.targetAmount,
      userId: req.userId,
    },
  })

  return res.status(201).json({
    savingAccount,
  })
})
