import { Router } from "express"
import { requireAuth } from "#middleware/require-auth.js"

// Create one global router for assistant routes
const assistantRouter = Router()
assistantRouter.use(requireAuth)

export { assistantRouter }