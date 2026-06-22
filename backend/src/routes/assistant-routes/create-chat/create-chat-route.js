import { chatSchema } from "#schemas/chat-schemas.js"
import { generateResponse } from "#assistant/generate-response.js"

// Import router
import { assistantRouter } from "../assistant-router.js"

// Import tools
import { tools } from "./tools.js"

// Helper functions
import { createMessage } from "#routes/assistant-routes/create-chat/helper-functions/index.js"
import { getSavedMessages } from "../get-saved-messages/helper-functions/get-saved-messages-helper.js"
import { getSavedSummary } from "../get-saved-messages/helper-functions/get-saved-summary-helper.js"
import { compactMemory } from "#assistant/memory/compact-memory.js"
import { createOrUpdateSummary } from "./helper-functions/create-or-update-summary-helper.js"

// Endpoint for communicating with AI assistant
assistantRouter.post("/chat", async (req, res) => {
    const validationResult = chatSchema.safeParse(req.body)

    if (!validationResult.success) {
        console.log(validationResult.error)
        return res.status(400).json({
            error: validationResult.error.issues[0].message,
        })
    }

    const memory = {
        messages: [],
        summary: "",
    }

    try {
        const savedMessages = await getSavedMessages(req.userId)

        for(let i = 0 ; i < savedMessages.length ; i++) {
            memory.messages.push({
                role: savedMessages[i].role,
                content: savedMessages[i].content,
            })
        }

        const savedSummary = await getSavedSummary(req.userId)

        memory.summary = savedSummary
    }
    catch {
        return res.status(400).json({
            error: "Could not update memory buffer",
        })
    }

    // Amount of messages stored
    const memoryLength = memory.messages.length

    // Check if memory length is greater than 12
    // NEXT STEP - Refactor into a seperate file ~40 lines long
    try {
        if (memoryLength >= 12) {
            const leftOvers = memory.messages.slice(memoryLength - 6, memoryLength)
            const requireCompacting = memory.messages.slice(memoryLength - 12, memoryLength - 6)

            // Ensure for the last 12 messages, we compact the first 6 and leave the last 6
            // For example: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
            // 1. [1,2,3,4,5,6] is compacted already, so we ignore this
            // 2. [7,8,9,10,11,12] needs to be compacted
            // 3. [13,14,15,16,17,18] is the leftover values we will assign to memory
            const modLength = memoryLength % 6

            if (modLength === 0) {
                try {
                    const compactedContext = await compactMemory(requireCompacting, memory.summary)

                    if (!compactedContext || typeof compactedContext !== "string") {
                        throw new Error("Invalid compacted context")
                    }

                    console.log(compactedContext)
                    
                    await createOrUpdateSummary(req.userId, compactedContext)

                    memory.summary = compactedContext
                    memory.messages = leftOvers
                }
                catch {
                    throw new Error("Could not compact context")
                }
            }
            else {
                const modLeftOvers = (memoryLength % 6) + 6
                memory.messages = memory.messages.slice(memoryLength - modLeftOvers, memoryLength)
            }
        }
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

        memory.messages.push(userMessage)

        // Send user message to Ollama Cloud service API
        const data = await generateResponse(memory.messages, memory.summary)

        if (data.type === "message") {

            const assistantMessage = {
                role: "assistant",
                content: data.response,
            }

            // Create user and assistant messages after succeeding
            await createMessage(userMessage, req.userId)
            await createMessage(assistantMessage, req.userId)

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
            
            // Create user and assistant messages after succeeding
            await createMessage(userMessage, req.userId)
            await createMessage(assistantMessage, req.userId)

            let event

            if ((data.tool === "createTask" || data.tool === "updateTask") && toolResponse.startsWith("Task")) {
                event = "tasks-updated"
            }

            if ((data.tool === "createFinances" || data.tool === "updateFinances") && toolResponse.startsWith("Finance")) {
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
