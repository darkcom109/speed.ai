const compactMemorySystemPrompt = `
You are a memory system context compacter.
You will compact messages/context in half, for example:

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
                    content: `${}`
                }
            ]
        })
    })
}