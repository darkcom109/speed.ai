import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

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

export { app }
