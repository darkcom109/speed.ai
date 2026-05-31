const compactMemorySystemPrompt = `
You are a conversation memory compacter.

Your job is to summarize older chat messages so the assistant can remember useful context later.

Rules:
- Return plain text only.
- Do not return JSON.
- Do not use markdown.
- Do not mention that you are summarizing.
- Keep the summary to one short paragraph.
- Preserve important user preferences, goals, decisions, and project details.
- Preserve any unresolved tasks or follow-up intentions.
- Ignore small talk unless it reveals a useful preference.
- If a previous summary is provided, merge the new information into it instead of replacing it completely.
- Do not invent facts that are not present in the messages.

The final summary should be 3 to 4 sentences maximum.
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