import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"

const savingRouter = Router()

savingRouter.use(requireAuth)

export { savingRouter }
