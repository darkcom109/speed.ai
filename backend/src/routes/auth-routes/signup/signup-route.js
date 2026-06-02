import argon2 from "argon2"

import prisma from "#prisma/client.js"
import { signupSchema } from "#schemas/auth-schemas.js"
import { createAuthToken, setAuthCookie } from "#utils/auth-cookie.js"

import { authRouter } from "../auth-router.js"

authRouter.post("/signup", async (req, res) => {
  const result = signupSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  const { name, email, password } = result.data

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return res.status(409).json({
      error: "Email already exists",
    })
  }

  const passwordHash = await argon2.hash(password)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  const token = createAuthToken(user.id)
  setAuthCookie(res, token)

  return res.status(201).json({
    user,
  })
})
