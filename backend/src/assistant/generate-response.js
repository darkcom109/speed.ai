import { cleanJsonResponse } from "../assistant/helper-functions/clean-json-response.js"
import { systemPrompt } from "./assistant-prompt.js"

// Generate response through Ollama Cloud service and parse as JSON
export async function generateResponse(memory) {
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
                    content: `Here is the summary of the conversation so far: ${memory.summary}`
                },
                ...memory.messages
            ]
        })
    })

    const data = await response.json()

    console.log(data)

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
