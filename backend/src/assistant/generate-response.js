import { systemPrompt } from "./assistant-prompt.js"
import { cleanJsonResponse } from "../assistant/helper-functions/clean-json-response.js"

// Generate response through Ollama Cloud service and parse as JSON
export async function generateResponse(message) {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: {
            Authorization : `Bearer ${process.env.OLLAMA_API_KEY}`,
            "Content-Type": "application/json"
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
                    content: message,
                }
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
