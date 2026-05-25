import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import crypto from "node:crypto"

dotenv.config()

const users = []

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.json({ ok: true })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required"})
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters"})
    }

    const existingUser = users.find((user) => user.email === email)

    if (existingUser) {
        return res.status(409).json({ error: "Email already exists" })
    }

    const user = {
        id: crypto.randomUUID(),
        name,
        email
    }

    users.push({ ...user, password})

    res.status(201).json({
        user,
        token: "fake-dev-token"
    })
})