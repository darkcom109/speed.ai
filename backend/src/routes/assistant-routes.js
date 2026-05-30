import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"
import prisma from "../../prisma/client.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const systemPrompt = `
You are speed.ai, a dashboard and productivity assistant.
Answer normally and briefly for general conversation.
Do not use markdown.

You have one tool available:
g

Only reply with exactly g when the user clearly asks to view, list, show, check, or retrieve their tasks.
Do not reply with g for greetings, small talk, questions about what you can do, or general productivity advice.
If the user asks about tasks in a vague way, ask a short clarifying question instead of replying with g.
`

async function getTasks(userId) {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId
        },
    })

    return tasks
}

async function generateResponse(message) {
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434"
    const ollamaModel = process.env.OLLAMA_MODEL

    if (!ollamaModel) {
        throw new Error("OLLAMA_MODEL is not configured")
    }

    if (ollamaUrl === "https://ollama.com" && !process.env.OLLAMA_API_KEY) {
        throw new Error("OLLAMA_API_KEY is required for Ollama Cloud")
    }

    const headers = {
        "Content-Type": "application/json",
    }

    if (process.env.OLLAMA_API_KEY) {
        headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`
    }

    const response = await fetch(`${ollamaUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: ollamaModel,
            stream: false,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    })

    const data = await response.json()

    if (!response.ok) {
        const errorMessage = typeof data.error === "string"
            ? data.error
            : data.error?.message

        throw new Error(errorMessage || "AI assistant failed")
    }

    return data.message.content
}

assistantRouter.post("/chat", async (req, res) => {
    const validationResult = chatSchema.safeParse(req.body)

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.issues[0].message,
        })
    }

    const { message } = validationResult.data

    try {
        let response = await generateResponse(message)

        if (response.trim() === "g") {
            const tasks = await getTasks(req.userId)

            response = tasks
                .map((task) => `- ${task.title}`)
                .join("\n")
        }

        return res.status(200).json({
            message: response
        })
    }
    catch (error) {
        console.error("Assistant failed to respond:", error)

        return res.status(500).json({
            error: "Assistant failed to respond"
        })
    }
})

export { assistantRouter }
