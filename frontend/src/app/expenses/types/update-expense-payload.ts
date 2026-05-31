import type { ExpenseKind } from "@/app/expenses/types/expense"

export type UpdateExpensePayload = {
  title?: string
  amount?: number
  kind?: ExpenseKind
  category?: string
  spentAt?: string
}
