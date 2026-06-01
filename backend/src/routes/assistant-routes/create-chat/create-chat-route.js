import { chatSchema } from "#schemas/chat-schemas.js"
import { generateResponse } from "#assistant/generate-response.js"
import { memory } from "#assistant/memory/memory-storage.js"

// Import router
import { assistantRouter } from "../assistant-router.js"

// Import tools
import { tools } from "./tools.js"

// Helper functions
import { createMessage, checkMemoryLength } from "#routes/assistant-routes/create-chat/helper-functions/index.js"

// Endpoint for communicating with AI assistant
assistantRouter.post("/chat", async (req, res) => {
    const validationResult = chatSchema.safeParse(req.body)

    if (!validationResult.success) {
        return res.status(400).json({
            error: validationResult.error.issues[0].message,
        })
    }

    // Check if memory length is 0 or greater than 12
    try {
        const memoryLength = memory.messages.length

        await checkMemoryLength(memoryLength, req.userId)
    }
    catch {
        return res.status(400).json({
            error: "Could not compact context",
        })
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
