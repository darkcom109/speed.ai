import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"
import prisma from "../../prisma/client.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const systemPrompt = `
You are speed.ai, a dashboard and productivity assistant.
Answer briefly.
Do not use markdown.
Do not think step by step.
Return only valid JSON.
Do not wrap the JSON in markdown.
Do not include extra text before or after the JSON.

You have one tool available:
getTasks()

If the user clearly asks to view, list, show, check, or retrieve their tasks, return exactly:
{"type":"tool","tool":"getTasks"}

For normal responses, return exactly:
{"type":"message","response":"your response here"}
`

const tools = {
    "getTasks": getTasks
}

async function getTasks(userId) {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId
        },
        take: 5
    })

    const parsedTasks = tasks.length
        ? tasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
        : "You do not have any tasks yet."

    return parsedTasks
}

function cleanJsonResponse(content) {
    return content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
}

async function generateResponse(message) {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: {
            Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: process.env.OLLAMA_MODEL,
            stream: false,
            think: false,
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
        throw new Error(data.error || "AI assistant failed")
    }

    const parsedData = JSON.parse(cleanJsonResponse(data.message.content))

    return parsedData
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
        const data = await generateResponse(message)

        if (data.type === "message") {
            return res.status(200).json({
                message: data.response
            })
        }
        else {
            const tool = tools[data.tool]

            if (!tool) {
                return res.status(400).json({
                    error: "AI assistant could not perform task"
                })
            }

            const toolResponse = await tool(req.userId)

            return res.status(200).json({
                message: toolResponse
            })
        }
    }
    catch (error) {
        console.error("Assistant failed to respond:", error)

        return res.status(500).json({
            error: "Assistant failed to respond"
        })
    }
})

export { assistantRouter }
