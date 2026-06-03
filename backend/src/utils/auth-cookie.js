import jwt from "jsonwebtoken"

const AUTH_COOKIE_NAME = "token"

const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
}

// Create a signed JWT for the authenticated user
function createAuthToken(userId) {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  )
}

// Store the auth token as an HTTP-only cookie
function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token,
    authCookieOptions,
  )
}

// Remove the auth cookie from the response
function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions)
}

export {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  createAuthToken,
  setAuthCookie,
}
