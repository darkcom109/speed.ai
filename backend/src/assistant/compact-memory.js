const compactMemorySystemPrompt = `
You are a memory system context compacter.
If there has been a previous summary, then I want you to take that into account
too of the conversation.
You will summarise a total set of 6 messages between a user and AI,
then add this summary ontop of the prior summary
MAXIMUM ONE PARAGRAPH (3 - 4 sentences at max)

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

    console.log(data.message.content)

    return data.message.content
}