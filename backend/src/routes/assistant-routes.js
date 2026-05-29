import { Router } from "express"

import { requireAuth } from "../middleware/require-auth.js"
import { chatSchema } from "../schemas/chat-schemas.js"

const assistantRouter = Router()
assistantRouter.use(requireAuth)

function createAssistantResponse(message) {
    return `You said: ${message}`
}

assistantRouter.post("/chat", async (req, res) => {
    const result = chatSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues[0].message,
        })
    }

    const { message } = result.data

    return res.json({
        message: createAssistantResponse(message),
    })
})

export { assistantRouter }
