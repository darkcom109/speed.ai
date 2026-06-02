import { z } from "zod"

// Chat validators for generating messages
const chatSchema = z.object({
    message: z.string().min(1, "Message is required")
})

export { chatSchema }