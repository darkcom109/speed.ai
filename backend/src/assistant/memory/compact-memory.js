import { compactMemorySystemPrompt } from "../prompts/compact-memory-prompt.js"

// Compact memory once total messages exceeds 12, then add summary to memory
export async function compactMemory(memory) {
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
                    content: `${compactMemorySystemPrompt}`,
                },
                {
                    role: "user",
                    content: `Compact these messages into a sentence: ${JSON.stringify(memory.messages.slice(0, 6))}`,
                },
                {
                    role: "user",
                    content: `This is the previous summary: ${JSON.stringify(memory.summary)}`,
                }
            ]
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to compact memory")
    }

    return data.message.content
}