import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

// Import Routers
import {
  authRouter,
  taskRouter,
  noteRouter,
  notificationRouter,
  expenseRouter,
  weatherRouter,
  holidayRouter,
  assistantRouter,
  githubRouter,
  projectRouter,
  savingRouter,
  tflRouter,
  futurePredictionRouter,
} from "#routes/index.js"

const app = express()
const isProduction = process.env.NODE_ENV === "production"
const configuredCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

if (isProduction) {
  app.set("trust proxy", 1)
}

// Express middleware

// Allows the frontend to call the backend from another origin/port
if (!isProduction || configuredCorsOrigins.length > 0) {
  const allowedOrigins = configuredCorsOrigins.length
    ? configuredCorsOrigins
    : ["http://localhost:5173"]

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error("Origin is not allowed by CORS"))
      },
      credentials: true,
    })
  )
}

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
app.use("/api/tasks", taskRouter)
app.use("/api/notes", noteRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/expenses", expenseRouter)
app.use("/api/projects", projectRouter)
app.use("/api/savings", savingRouter)
app.use("/api/weather", weatherRouter)
app.use("/api/holidays", holidayRouter)
app.use("/api/assistant", assistantRouter)
app.use("/api/github", githubRouter)
app.use("/api/tfl", tflRouter)
app.use("/api/prediction", futurePredictionRouter)

if (isProduction && !process.env.VERCEL) {
  const frontendDirectory = fileURLToPath(
    new URL("../../frontend/dist/", import.meta.url)
  )
  const frontendEntryPoint = fileURLToPath(
    new URL("../../frontend/dist/index.html", import.meta.url)
  )

  if (existsSync(frontendEntryPoint)) {
    app.use(express.static(frontendDirectory))
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api/")) {
        next()
        return
      }

      res.sendFile(frontendEntryPoint)
    })
  } else {
    console.warn(
      "Frontend production build was not found. Run the frontend build before starting the server."
    )
  }
}

export { app }
