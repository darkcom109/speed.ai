import { OAuth2Client } from "google-auth-library"

import prisma from "#prisma/client.js"
import { createAuthToken, setAuthCookie } from "#utils/auth-cookie.js"

import { authRouter } from "../auth-router.js"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Create an account or login through Google Authentication
authRouter.post("/google", async (req, res) => {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({
      error: "Google credential is required",
    })
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()

  if (!payload?.sub || !payload.email) {
    return res.status(400).json({
      error: "Invalid Google credential",
    })
  }

  const googleId = payload.sub
  const email = payload.email
  const name = payload.name || email

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        { email },
      ],
    },
  })

  if (user && !user.googleId) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        googleId,
      },
    })
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
      },
    })
  }

  const token = createAuthToken(user.id)
  setAuthCookie(res, token)

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  })
})
