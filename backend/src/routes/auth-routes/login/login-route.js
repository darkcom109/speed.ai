import argon2 from "argon2"

import prisma from "#prisma/client.js"
import { loginSchema } from "#schemas/auth-schemas.js"
import { createAuthToken, setAuthCookie } from "#utils/auth-cookie.js"

import { authRouter } from "../auth-router.js"

// Log user in
authRouter.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    }
  })

  if (!user || !user.passwordHash) {
    return res.status(401).json({
      error: "Invalid email or password",
    })
  }

  const validPassword = await argon2.verify(user.passwordHash, password)

  if (!validPassword) {
    return res.status(401).json({
      error: "Invalid email or password",
    })
  }

  const token = createAuthToken(user.id)
  setAuthCookie(res, token)

  return res.status(200).json({
    user
  })
})
