import { Router } from "express"

import { requireAuth } from "#middleware/require-auth.js"

const notificationRouter = Router()

notificationRouter.use(requireAuth)

export { notificationRouter }