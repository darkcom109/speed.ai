import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"
import prisma from "../../prisma/client.js"

// Assistant related imports
import { systemPrompt } from "../assistant/assistant-prompt.js"
import { cleanJsonResponse } from "../assistant/assistant-tools/clean-json-response.js"
import { getTasks } from "../assistant/assistant-tools/get-tasks.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const tools = {
    "getTasks": getTasks
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
