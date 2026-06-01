import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"

const expenseRouter = Router()

expenseRouter.use(requireAuth)

export { expenseRouter }
