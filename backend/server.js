import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import argon2 from "argon2"
import { z } from "zod"
import prisma from "./prisma/client.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())

// Replaces the need for code such as: if (!name || !email || !password)
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
    // Use zod to verify signup credentials
    const result = signupSchema.safeParse(req.body)

    // If unsuccessful, return status 400
    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { name, email, password } = result.data

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    // If duplicate email exists, return error 409
    if (existingUser) {
        return res.status(409).json({
            error: "Email already exists",
        })
    }

    // Hash password
    const passwordHash = await argon2.hash(password)

    // Create user in database
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    })

    // Create JWT token
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    // Send cookie back to the browser
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // Return user data back
    return res.status(201).json({
        user,
    })
})

app.post("/api/auth/login", async (req, res) => {

    // Check email and password length and validity
    const loginSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    })

    // Parse data to the schema
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { email, password } = result.data

    // Check if the user email exists in the DB
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // If the user doesn't exist in the DB, return an error
    if (!user) {
        return res.status(401).json({
            error: "Invalid email or password"
        })
    }

    // Check password stored in the DB compared to the password submitted
    const validPassword = await argon2.verify(user.passwordHash, password)

    // Return an error if passwords do not match
    if (!validPassword) {
        return res.status(401).json({
            error: "Invalid email or password"
        })
    }

    // Create a JWT token
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d"}
    )

    // Create a cookie
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    })
})

function requireAuth(req, res, next) {
    // Obtain JWT token
    const token = req.cookies.token

    // Return 401 if the cookie doesn't exist
    if (!token) {
        return res.status(401).json({
            error: "Not authenticated"
        })
    }

    // Verify JWT token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = payload.userId

        next()
    }
    catch {
        return res.status(401).json({
            error: "Invalid or expired token"
        })
    }
}

app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }
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

app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })

    return res.status(200).json({
        message: "logged out",
    })
})

const PORT = process.env.PORT || 3001

// Run server on port 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
