export type ExpenseKind = "expense" | "income"

export type Expense = {
  id: string
  title: string
  amount: number
  kind: ExpenseKind
  category: string
  spentAt: string
  createdAt: string
  updatedAt: string
  userId: string
}
