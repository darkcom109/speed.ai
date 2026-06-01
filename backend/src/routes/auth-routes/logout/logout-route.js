import { clearAuthCookie } from "#utils/auth-cookie.js"

import { authRouter } from "../auth-router.js"

// Log user out
authRouter.post("/logout", (req, res) => {
  clearAuthCookie(res)

  return res.status(200).json({
    message: "logged out",
  })
})
