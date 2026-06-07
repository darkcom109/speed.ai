import { z } from "zod"

const createSavingAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  currentAmount: z.coerce
    .number()
    .nonnegative("Current amount cannot be negative")
    .optional(),
  targetAmount: z.coerce
    .number()
    .positive("Target amount must be greater than 0")
    .optional(),
})

const updateSavingAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  currentAmount: z.coerce
    .number()
    .nonnegative("Current amount cannot be negative")
    .optional(),
  targetAmount: z.coerce
    .number()
    .positive("Target amount must be greater than 0")
    .nullable()
    .optional(),
})

export { createSavingAccountSchema, updateSavingAccountSchema }
