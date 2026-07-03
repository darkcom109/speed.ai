import { Router } from "express"
import { requireAuth } from "#middleware/require-auth.js"

const projectRouter = Router()
projectRouter.use(requireAuth)

export { projectRouter }
