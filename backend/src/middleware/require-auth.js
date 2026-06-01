import jwt from "jsonwebtoken"

import { AUTH_COOKIE_NAME } from "#utils/auth-cookie.js"

function requireAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE_NAME]

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated",
    })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = payload.userId

    next()
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}

export { requireAuth }
