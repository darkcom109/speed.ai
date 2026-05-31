import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"

// Assistant related imports
import {
    createTask,
    getTasks,
    getTasksToday,
    getExpenses,
    getIncomes,
} from "../assistant/assistant-tools/index.js"
import { generateResponse } from "../assistant/generate-response.js"
import { memory } from "../assistant/memory-storage.js"
import { compactMemory } from "../assistant/compact-memory.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

// Available tools for AI assistant 
const tools = {
    "getTasks": getTasks,
    "getTasksToday": getTasksToday,
    "createTask": createTask,
    "getExpenses": getExpenses,
    "getIncomes": getIncomes,
}

// Endpoint for communicating with AI assistant
assistantRouter.post("/chat", async (req, res) => {
    const validationResult = chatSchema.safeParse(req.body)

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.issues[0].message,
        })
    }

    const memoryLength = memory.messages.length

    if (memoryLength > 12) {
        try {
            const compactedContext = await compactMemory(memory)
            console.log(compactedContext)
            memory.summary = compactedContext
        }
        catch {
            return res.status(400).json({
                error: "Could not compact context"
            })
        }
        memory.messages.splice(0, 6)
    }

    const { message } = validationResult.data

    memory.messages.push({
        role: "user",
        content: message,
    })

    try {
        // Send user message to Ollama Cloud service API
        const data = await generateResponse(memory)

        if (data.type === "message") {
            memory.messages.push({
                role: "assistant",
                content: data.response,
            })

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

            const toolResponse = await tool(req.userId, data.args || {})

            memory.messages.push({
                role: "assistant",
                content: toolResponse,
            })

            const event = data.tool === "createTask" && toolResponse.startsWith("Task")
                ? "tasks-updated"
                : undefined

            return res.status(200).json({
                message: toolResponse,
                event,
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
