import { GoogleGenAI } from "@google/genai"
import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
})

assistantRouter.post("/chat", async (req, res) => {
    const result = chatSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { message } = result.data

    const systemPrompt = `You are an AI assistant for speed.ai, a productivity tool,
    you are to help the user with any questions and to be polite, keep answers concise
    and practical
    `

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "model",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "user",
                    parts: [{text: message}]
                }
            ],
        })

        return res.json({
            message: response.text
        })
    }
    catch {
        return res.status(500).json({
            error: "Assistant failed to respond"
        })
    }
})

export { assistantRouter }