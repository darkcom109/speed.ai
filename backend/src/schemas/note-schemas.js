import { z } from "zod"

const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  folder: z.string().min(1, "Folder is required").optional(),
})

const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional(),
  folder: z.string().min(1, "Folder is required").optional(),
})

export { createNoteSchema, updateNoteSchema }
