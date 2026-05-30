import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"
import prisma from "../../prisma/client.js"

// Assistant related imports
import { getTasks, getTasksToday } from "../assistant/assistant-tools/index.js"
import { systemPrompt } from "../assistant/assistant-prompt.js"
import { generateResponse } from "../assistant/generate-response.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

// Available tools for AI assistant 
const tools = {
    "getTasks": getTasks,
    "getTasksToday": getTasksToday
}

const memory = [
    {
        role: "system",
        content: systemPrompt,
    }
]

// Endpoint for communicating with AI assistant
assistantRouter.post("/chat", async (req, res) => {
    const validationResult = chatSchema.safeParse(req.body)

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.issues[0].message,
        })
    }

    const { message } = validationResult.data

    // Add message to global memory
    memory.push(
        {
            role: "user",
            content: message
        }
    )

    // Prevents memory from becoming too large
    if (memory.length > 5) {
        memory.splice(-5)
    }

    try {
        // Send user message to Ollama Cloud service API
        const data = await generateResponse(message, memory)

        if (data.type === "message") {
            return res.status(200).json({
                message: data.response
            })
        }
        else {
            // Obtain tool, validate and call function
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
