import type { CreateExpensePayload } from "@/app/expenses/types/create-expense-payload"
import type { Expense } from "@/app/expenses/types/expense"
import type { UpdateExpensePayload } from "@/app/expenses/types/update-expense-payload"

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch("http://localhost:3001/api/expenses", {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load expenses")
  }

  return data.expenses
}

export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense> {
  const response = await fetch("http://localhost:3001/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to create expense")
  }

  return data.expense
}

export async function importExpenses(
  expenses: CreateExpensePayload[]
): Promise<number> {
  const response = await fetch("http://localhost:3001/api/expenses/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      expenses,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to import finances")
  }

  return data.count
}

export async function updateExpense(
  expenseId: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  const response = await fetch(`http://localhost:3001/api/expenses/${expenseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to update expense")
  }

  return data.expense
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const response = await fetch(`http://localhost:3001/api/expenses/${expenseId}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete expense")
  }
}

export async function deleteAllExpenses(): Promise<void> {
  const response = await fetch("http://localhost:3001/api/expenses/delete_all", {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete all finances")
  }
}
