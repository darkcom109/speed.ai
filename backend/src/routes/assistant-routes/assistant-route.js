import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"
import { chatSchema } from "#schemas/chat-schemas.js"
import prisma from "#prisma/client.js"

// Assistant related imports
import {
    createFinances,
    createTask,
    getTasks,
    getTasksToday,
    getExpenses,
    getIncomes,
} from "#assistant/assistant-tools/index.js"
import { generateResponse } from "#assistant/generate-response.js"
import { memory } from "#assistant/memory/memory-storage.js"
import { compactMemory } from "#assistant/memory/compact-memory.js"
import { getSavedMessages } from "#routes/assistant-routes/get-saved-messages.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

// Available tools for AI assistant 
const tools = {
    "getTasks": getTasks,
    "getTasksToday": getTasksToday,
    "createTask": createTask,
    "createFinances": createFinances,
    "getExpenses": getExpenses,
    "getIncomes": getIncomes,
}

async function createMessage(message, userId) {
    await prisma.message.create({
        data: {
            role: message.role,
            content: message.content,
            userId: userId,
        }
    })
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

    if (memoryLength === 0) {
        const savedMessages = await getSavedMessages(req.userId)

        for(let i = 0 ; i < savedMessages.length ; i++) {
            const message = savedMessages[i]

            memory.messages.push({
                role: message.role,
                content: message.content,
            })
        }
    }

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

    const userMessage = {
        role: "user",
        content: message,
    }

    try {
        // Create user message
        await createMessage(userMessage, req.userId)

        memory.messages.push(userMessage)

        // Send user message to Ollama Cloud service API
        const data = await generateResponse(memory)

        if (data.type === "message") {

            const assistantMessage = {
                role: "assistant",
                content: data.response,
            }

            await createMessage(assistantMessage, req.userId)

            memory.messages.push(assistantMessage)

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

            const assistantMessage = {
                role: "assistant",
                content: toolResponse,
            }

            await createMessage(assistantMessage, req.userId)

            memory.messages.push(assistantMessage)

            let event

            if (data.tool === "createTask" && toolResponse.startsWith("Task")) {
                event = "tasks-updated"
            }

            if (data.tool === "createFinances" && toolResponse.startsWith("Finance")) {
                event = "finances-updated"
            }

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
