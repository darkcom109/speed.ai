import "dotenv/config"

import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

import { authRouter } from "./routes/auth-routes.js"
import { holidayRouter } from "./routes/holiday-routes.js"
import { noteRouter } from "./routes/note-routes.js"
import { taskRouter } from "./routes/task-routes.js"
import { weatherRouter } from "./routes/weather-routes.js"
import { assistantRouter } from "./routes/assistant-routes/assistant-route.js"
import { dashboardSummaryRouter } from "./routes/assistant-routes/dashboard-summary-route.js"
import { expenseRouter } from "./routes/expense-routes.js"
import { githubRouter } from "./routes/github-routes.js"
import { tflRouter } from "./routes/tfl-routes.js"

const app = express()

// Express middleware

// Allows the frontend to call the backend from another origin/port
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

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
app.use("/api/expenses", expenseRouter)
app.use("/api/weather", weatherRouter)
app.use("/api/holidays", holidayRouter)
app.use("/api/assistant", assistantRouter)
app.use("/api/assistant", dashboardSummaryRouter)
app.use("/api/github", githubRouter)
app.use("/api/tfl", tflRouter)

export { app }
