import { Router } from "express"
import { requireAuth } from "#middleware/require-auth.js"

const futurePredictionRouter = Router()
futurePredictionRouter.use(requireAuth)

export { futurePredictionRouter }