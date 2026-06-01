import { cleanJsonResponse } from "../assistant/helper-functions/clean-json-response.js"
import { systemPrompt } from "./prompts/assistant-prompt.js"

// Generate response through Ollama Cloud service and parse as JSON
export async function generateResponse(memory) {
    
    // Ensures each response has the most recent time
    const currentTime = `Current date: ${new Date()}`

    // memory.summary = "" if the backend server has just started/restarted
    const summary = memory.summary ? memory.summary : "The conversation has just started"
    
    // Call Ollama API
    const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: {
            Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: process.env.OLLAMA_MODEL,
            stream: false,
            think: true,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "system",
                    content: currentTime,
                },
                {
                    role: "system",
                    content: `Here is the summary of the conversation so far: ${memory.summary}`
                },
                ...memory.messages
            ]
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "AI assistant failed")
    }

    try {
        return JSON.parse(cleanJsonResponse(data.message.content))
    }
    catch {
        return {
            type: "message",
            response: data.message.content,
        }
    }
}
