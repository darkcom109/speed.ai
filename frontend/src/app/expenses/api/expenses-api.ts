import type { CreateExpensePayload } from "@/app/expenses/types/create-expense-payload"
import type { Expense } from "@/app/expenses/types/expense"
import type { UpdateExpensePayload } from "@/app/expenses/types/update-expense-payload"
import { apiClient } from "@/lib/api-client"

export async function getExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get<{ expenses: Expense[] }>("/expenses")

  return data.expenses
}

export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense> {

  const { data } = await apiClient.post<{ expense: Expense }>("/expenses", payload)

  return data.expense
}

export async function importExpenses(
  expenses: CreateExpensePayload[]
): Promise<number> {
  const { data } = await apiClient.post<{ count: number }>("/expenses/import", expenses)

  return data.count
}

export async function updateExpense(
  expenseId: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  const { data } = await apiClient.patch<{ expense: Expense }>(`/expenses/${expenseId}`, payload)

  return data.expense
}

export async function deleteExpense(expenseId: string): Promise<void> {
  apiClient.delete(`/expenses/${expenseId}`)
}

export async function deleteAllExpenses(): Promise<void> {
  apiClient.delete("/expenses/delete_all")
}
