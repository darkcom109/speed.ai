import { compactMemory } from "#assistant/memory/compact-memory.js"
import { getSavedMessages } from "#routes/assistant-routes/get-saved-messages/helper-functions/get-saved-messages-helper.js"
import { memory } from "#assistant/memory/memory-storage.js"

// Check if memory length exceeds 12 or equals 0
export async function checkMemoryLength(memoryLength, userId) {
    // Retrieve saved messages if memory length is 0
    if (memoryLength === 0) {
        const savedMessages = await getSavedMessages(userId)

        for(let i = 0 ; i < savedMessages.length ; i++) {
            const message = savedMessages[i]

            memory.messages.push({
                role: message.role,
                content: message.content,
            })
        }
    }

    // Compact context if memory length exceeds 12
    if (memoryLength > 12) {
        try {
            const compactedContext = await compactMemory(memory)
            memory.summary = compactedContext
        }
        catch {
            throw new Error("Could not compact context")
        }
        memory.messages.splice(0, 6)
    }
}