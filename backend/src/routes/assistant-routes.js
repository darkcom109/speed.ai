import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"
import prisma from "../../prisma/client.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const systemPrompt = `
    You are speed.ai, a dashboard and task management AI agent,
    if the user asks to get tasks then just reply with exactly: getTasks()
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
    const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: process.env.OLLAMA_MODEL,
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

        if (response.trim() === "getTasks()") {
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
