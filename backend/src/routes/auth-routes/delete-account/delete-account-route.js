import prisma from "#prisma/client.js"
import { requireAuth } from "#middleware/require-auth.js"
import { clearAuthCookie } from "#utils/auth-cookie.js"

import { authRouter } from "../auth-router.js"

// Delete user account
authRouter.delete("/me", requireAuth, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.userId,
    },
  })

  clearAuthCookie(res)

  return res.status(200).json({
    message: "Account deleted",
  })
})
