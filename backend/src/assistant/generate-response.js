import { cleanJsonResponse } from "#assistant/helper-functions/clean-json-response.js"
import { systemPrompt } from "#assistant/prompts/assistant-prompt.js"

// Generate response through Ollama Cloud service and parse as JSON
export async function generateResponse(messages, summary) {

    // Ensures each response has the most recent time
    const currentTime = `Current date: ${new Date()}`

    // memory.summary = "" if the backend server has just started/restarted
    const overallSummary = summary ? summary : "The conversation has just started"

    console.log(overallSummary)
    
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
                    content: `Here is the summary of the conversation so far: ${JSON.stringify(overallSummary)}`
                },
                ...messages
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
