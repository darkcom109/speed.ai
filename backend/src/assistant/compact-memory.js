import { systemPrompt } from "./assistant-prompt.js"

const compactMemorySystemPrompt = `
You are a memory system context compacter.
You will summarise a total set of 6 messages between a user and AI,
then return the summary as a string
`

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
                    content: systemPrompt
                },
                {
                    role: "system",
                    content: `${compactMemorySystemPrompt}`,
                },
                {
                    role: "user",
                    content: `Compact these messages into a sentence: ${JSON.stringify(memory)}`,
                }
            ]
        })
    })

    const data = await response.json()

    console.log(data.message.content)

    return data.message.content
}