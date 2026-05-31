import type { ExpenseKind } from "@/app/expenses/types/expense"

export type CreateExpensePayload = {
  title: string
  amount: number
  kind?: ExpenseKind
  category?: string
  spentAt?: string
}
