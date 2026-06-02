import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"

const noteRouter = Router()

noteRouter.use(requireAuth)

export { noteRouter }
