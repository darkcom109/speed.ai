import { z } from "zod"

const researchRequestSchema = z.object({
  goal: z.string().min(1, "Goal is required"),
  prompt: z.string().optional(),
  maxIterations: z.number().int().min(1).max(6).optional(),
})

export {
  researchRequestSchema,
}
