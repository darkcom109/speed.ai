import { z } from "zod"

const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  kind: z.enum(["expense", "income"]).optional(),
  category: z.string().optional(),
  spentAt: z.string().datetime().optional(),
})

const updateExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0").optional(),
  kind: z.enum(["expense", "income"]).optional(),
  category: z.string().optional(),
  spentAt: z.string().datetime().optional(),
})

const importExpensesSchema = z.object({
  expenses: z.array(createExpenseSchema).min(1, "At least one finance entry is required"),
})

export { createExpenseSchema, importExpensesSchema, updateExpenseSchema }
