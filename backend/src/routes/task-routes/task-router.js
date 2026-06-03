import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"

const taskRouter = Router()

taskRouter.use(requireAuth)

export { taskRouter }
