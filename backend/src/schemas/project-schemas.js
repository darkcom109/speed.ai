import { z } from "zod"

const projectStatusSchema = z.enum(["active", "paused", "done"])
const projectTaskStatusSchema = z.enum(["backlog", "next", "in_progress", "done"])
const projectAiModeSchema = z.enum(["generate_tasks", "rebalance_board", "help", "brief"])

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: projectStatusSchema.optional(),
})

const updateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: projectStatusSchema.optional(),
})

const createProjectTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: projectTaskStatusSchema.optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  dueDate: z.string().datetime().optional(),
})

const updateProjectTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: projectTaskStatusSchema.optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

const projectAiRequestSchema = z.object({
  mode: projectAiModeSchema,
  prompt: z.string().optional(),
})

export {
  createProjectSchema,
  updateProjectSchema,
  createProjectTaskSchema,
  updateProjectTaskSchema,
  projectAiRequestSchema,
}
