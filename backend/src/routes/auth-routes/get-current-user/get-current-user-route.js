import prisma from "#prisma/client.js"
import { requireAuth } from "#middleware/require-auth.js"

import { authRouter } from "../auth-router.js"

// Verify if the user is logged in
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    })
  }

  return res.status(200).json({
    user,
  })
})
