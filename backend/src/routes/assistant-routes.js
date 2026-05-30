import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const systemPrompt = `
    You are speed.ai, a dashboard and task management AI agent,
    you are to help the user with anything it attempts to ask, do not hallucinate
    and do not include any markdowns
`

async function generateResponse(message) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error?.message || "AI assistant failed")
    }

    return data.choices[0].message.content
}

assistantRouter.post("/chat", async (req, res) => {
    const result = chatSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { message } = result.data

    try {
        const result = await generateResponse(message)

        return res.status(200).json({
            message: result
        })
    }
    catch {
        return res.status(500).json({
            error: "Assistant failed to respond"
        })
    }
})

export { assistantRouter }
