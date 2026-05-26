import argon2 from "argon2"
import { Router } from "express"

import prisma from "../../prisma/client.js"
import { requireAuth } from "../middleware/require-auth.js"
import { loginSchema, signupSchema } from "../schemas/auth-schemas.js"
import {
  clearAuthCookie,
  createAuthToken,
  setAuthCookie,
} from "../utils/auth-cookie.js"

const authRouter = Router()

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
}

authRouter.post("/signup", async (req, res) => {
  // Perform basic credential validation
  const result = signupSchema.safeParse(req.body)

  // If email is valid or password is too short, reject credentials
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    })
  }

  // Extract credential data
  const { name, email, password } = result.data

  // Check if user already exists in the DB
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  // If the email exists, reject with status 409
  if (existingUser) {
    return res.status(409).json({
      error: "Email already exists",
    })
  }

  // Hash password
  const passwordHash = await argon2.hash(password)

  // Create user in the DB
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: publicUserSelect, // Return basic user data
  })

  // Create auth token and set it
  const token = createAuthToken(user.id)
  setAuthCookie(res, token)

  return res.status(201).json({
    user,
  })
})

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
  })

  if (!user) {
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  })
})

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
    select: publicUserSelect,
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

authRouter.post("/logout", (req, res) => {
  clearAuthCookie(res)

  return res.status(200).json({
    message: "logged out",
  })
})

export { authRouter }
