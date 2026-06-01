import { z } from "zod"

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
})

const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().nullable().optional(),
})

export { createTaskSchema, updateTaskSchema }
