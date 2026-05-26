import "dotenv/config"

import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

import { authRouter } from "./routes/auth-routes.js"

const app = express()

// Express middleware

// Allows the frontend to call the backend from another origin/port
app.use(cors())

/*
Parses incoming JSON request bodies into req.body

req.body = {
  "email": "alex@example.com",
  "password": "password123"
}

Without app.use(express.json()), req.body would be undefined
*/
app.use(express.json())

/* 

Reads the cookie header from incoming requests and turns it into:

req.cookies

Cookie: token=abc123; theme=dark

req.cookies = {
  token: "abc123",
  theme: "dark"
}

The auth middleware uses it here:

const token = req.cookies.token
*/
app.use(cookieParser())

// Check API health
app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

// API routes
app.use("/api/auth", authRouter)

export { app }
